import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaTimes } from "react-icons/fa";
import { useGenerateQuizMutation } from "../../../../Features/auth/authApi";
import { useAppSelector } from "../../../../app/hooks/hooks";
import toast from "react-hot-toast";
import type { Quiz } from "../../../../Features/Types/types";

const QuizSetup: React.FC = () => {
  const [formData, setFormData] = useState({
    topic: "",
    difficulty: "easy",
    numQuestions: 5,
    file: undefined as File | undefined,
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [showFilePopup, setShowFilePopup] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const quizzes: Quiz[] = [];
  const navigate = useNavigate();
  const location = useLocation();
  const [generateQuiz] = useGenerateQuizMutation();
  const auth = useAppSelector((state) => state.auth);

  useEffect(() => {
    // Fetch past quizzes if needed
    // For now, we'll keep it empty or fetch from API
  }, []);

  // Load selected file from navigation state
  useEffect(() => {
    const state = location.state as { selectedFileId?: string; selectedFileName?: string };
    if (state?.selectedFileName) {
      setSelectedFileName(state.selectedFileName);
    }
  }, [location]);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'numQuestions' ? parseInt(value) : value
    }));
  };



  const handleGenerateQuiz = async () => {
    setIsGenerating(true);
    try {
      const result = await generateQuiz({
        topic: formData.topic,
        difficulty: formData.difficulty,
        numQuestions: formData.numQuestions,
        file: formData.file,
      }).unwrap();

      // Convert API questions to local format
      const convertedQuestions = result.data.questions.map((q: { question: string; options: Record<string, string>; answer: string; explanation: string }) => ({
        question: q.question,
        answers: Object.entries(q.options).map(([key, text]) => ({
          text: text as string,
          correct: key === q.answer,
        })),
        explanation: q.explanation,
      }));

      // Store in localStorage
      localStorage.setItem("questions", JSON.stringify(convertedQuestions));
      localStorage.setItem("playerName", auth.user?.fullName || "Anonymous");
      localStorage.setItem("quizTotalTime", (convertedQuestions.length * 10).toString());

      toast.success("Quiz generated successfully!");
      navigate("/dashboard/quizQuest");
    } catch (error) {
      console.error("Error generating quiz:", error);
      toast.error("Failed to generate quiz. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectQuiz = () => {

    navigate("/dashboard/quizQuest");
  };



  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10 px-4">
      <h1 className="text-2xl font-bold mb-6 text-[#0D9165]">
        Generate New Quiz
      </h1>
      <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-2xl border border-gray-200">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Topic
            </label>
            <input
              type="text"
              name="topic"
              value={formData.topic}
              onChange={handleFormChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#0D9165] focus:border-[#0D9165]"
              placeholder="Enter quiz topic"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Difficulty
            </label>
            <select
              name="difficulty"
              value={formData.difficulty}
              onChange={handleFormChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#0D9165] focus:border-[#0D9165]"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Number of Questions
            </label>
            <input
              type="number"
              name="numQuestions"
              value={formData.numQuestions}
              onChange={handleFormChange}
              min="1"
              max="20"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#0D9165] focus:border-[#0D9165]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Choose File (optional)
            </label>
            <div className="mt-1">
              <button
                type="button"
                onClick={() => setShowFilePopup(true)}
                className="px-4 py-2 bg-[#0D9165] text-white rounded-lg hover:bg-[#0a7a52] text-sm cursor-pointer"
              >
                Choose File
              </button>
            </div>
            {selectedFileName && (
              <p className="mt-2 text-sm text-gray-600">
                Selected file: {selectedFileName}
              </p>
            )}
          </div>
          <button
            onClick={handleGenerateQuiz}
            disabled={isGenerating || !formData.topic}
            className="w-full bg-[#0D9165] text-white px-4 py-2 rounded-lg hover:bg-[#0a7a52] disabled:opacity-50 cursor-pointer"
          >
            {isGenerating ? "Generating..." : "Generate Quiz"}
          </button>

        </div>
      </div>

      {quizzes.length > 0 && (
        <div className="mt-8 w-full max-w-2xl">
          <h2 className="text-xl font-bold mb-4 text-[#0D9165]">
            Past Quizzes
          </h2>
          <ul className="space-y-2">
            {quizzes.map((quiz: Quiz) => (
              <li
                key={quiz._id}
                className="bg-white shadow-sm rounded-lg p-4 flex justify-between items-center"
              >
                <div>
                  <h3 className="font-medium">{quiz.topic}</h3>
                  <p className="text-sm text-gray-500">
                    {quiz.difficulty} • {quiz.numQuestions} questions
                  </p>
                </div>
                <button
                  onClick={() => handleSelectQuiz()}
                  className="bg-[#0D9165] text-white px-4 py-2 rounded-lg hover:bg-[#0a7a52] cursor-pointer"
                >
                  Take Quiz
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* File Selection Popup */}
      {showFilePopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 relative">
            <button
              onClick={() => setShowFilePopup(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 cursor-pointer"
            >
              <FaTimes size={20} />
            </button>
            <h2 className="text-xl font-bold mb-4 text-[#0D9165]">Choose File Source</h2>
            <div className="space-y-3">
              <button
                onClick={() => {
                  setShowFilePopup(false);
                  navigate('/dashboard/upload?select=true');
                }}
                className="w-full bg-[#0D9165] text-white px-4 py-2 rounded-lg hover:bg-[#0a7a52] cursor-pointer"
              >
                Select from Uploaded Files
              </button>
              <button
                onClick={() => {
                  setShowFilePopup(false);
                  // Trigger file input click
                  const fileInput = document.createElement('input');
                  fileInput.type = 'file';
                  fileInput.accept = '.txt,.pdf,.doc,.docx';
                  fileInput.onchange = (e) => {
                    const target = e.target as HTMLInputElement;
                    const selectedFile = target.files?.[0];
                    if (selectedFile) {
                      setSelectedFileName(selectedFile.name);
                      setFormData(prev => ({ ...prev, file: selectedFile }));
                    }
                  };
                  fileInput.click();
                }}
                className="w-full bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 cursor-pointer"
              >
                Choose from System
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizSetup;
