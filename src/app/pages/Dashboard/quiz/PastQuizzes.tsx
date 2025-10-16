import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

interface PastQuiz {
  id: string;
  questions: Array<{
    question: string;
    answers: { text: string; correct: boolean }[];
    explanation?: string;
  }>;
  selectedAnswers: Record<number, number>;
  score: number;
  totalQuestions: number;
  playerName: string;
  completedAt: string;
  timeTaken: number;
}

const PastQuizzes: React.FC = () => {
  const navigate = useNavigate();
  const [pastQuizzes, setPastQuizzes] = useState<PastQuiz[]>([]);
  const [selectedQuiz, setSelectedQuiz] = useState<PastQuiz | null>(null);

  useEffect(() => {
    const storedPastQuizzes = localStorage.getItem("pastQuizzes");
    if (storedPastQuizzes) {
      const quizzes = JSON.parse(storedPastQuizzes);
      setPastQuizzes(quizzes.reverse()); // Show most recent first
    } else {
      toast.error("No past quizzes found!");
      navigate("/dashboard/quiz-setup");
    }
  }, [navigate]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const getPercentage = (score: number, total: number) => {
    return Math.round((score / total) * 100);
  };

  if (selectedQuiz) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-4 md:p-6 max-w-6xl w-full text-left max-h-screen overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold">Past Quiz Review</h1>
              <p className="text-gray-600">
                Completed on {formatDate(selectedQuiz.completedAt)} • Score: {selectedQuiz.score}/{selectedQuiz.totalQuestions} ({getPercentage(selectedQuiz.score, selectedQuiz.totalQuestions)}%)
              </p>
            </div>
            <button
              onClick={() => setSelectedQuiz(null)}
              className="bg-[#0D9165] text-white px-4 py-2 rounded-lg hover:bg-[#0a7a52] text-sm font-medium"
            >
              Back to Past Quizzes
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedQuiz.questions.map((question, index) => {
                const userAnswerIndex = selectedQuiz.selectedAnswers[index];
                const userAnswer =
                  userAnswerIndex !== undefined
                    ? question.answers[userAnswerIndex]
                    : null;
                const correctAnswer = question.answers.find(
                  (ans) => ans.correct
                );
                return (
                  <div key={index} className="p-4 border rounded-lg bg-gray-50">
                    <h3 className="font-semibold mb-3 text-sm">
                      {index + 1}. {question.question}
                    </h3>
                    <div className="flex flex-col space-y-2">
                      <p className="text-sm">
                        <span className="font-medium">Your answer:</span>{" "}
                        <span
                          className={
                            userAnswer?.correct
                              ? "text-green-600 font-semibold"
                              : "text-red-600 font-semibold"
                          }
                        >
                          {userAnswer ? userAnswer.text : "No answer selected"}
                        </span>
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Correct answer:</span>{" "}
                        <span className="text-green-600 font-semibold">
                          {correctAnswer?.text}
                        </span>
                      </p>
                    </div>
                    {question.explanation && (
                      <p className="mt-3 text-gray-700 italic text-sm">
                        <span className="font-medium">Explanation:</span> {question.explanation}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10 px-4">
      <h1 className="text-3xl font-bold mb-8 text-[#0D9165]">Past Quizzes</h1>

      {pastQuizzes.length === 0 ? (
        <div className="text-center">
          <p className="text-gray-600 mb-4">No past quizzes found.</p>
          <button
            onClick={() => navigate("/dashboard/quiz-setup")}
            className="bg-[#0D9165] text-white px-6 py-2 rounded-lg hover:bg-[#0a7a52]"
          >
            Generate New Quiz
          </button>
        </div>
      ) : (
        <div className="w-full max-w-4xl space-y-4">
          {pastQuizzes.map((quiz) => (
            <div
              key={quiz.id}
              className="bg-white shadow-md rounded-lg p-6 border border-gray-200"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    Quiz Completed
                  </h3>
                  <p className="text-sm text-gray-600">
                    {formatDate(quiz.completedAt)} • Time taken: {formatTime(quiz.timeTaken)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-[#0D9165]">
                    {quiz.score}/{quiz.totalQuestions}
                  </p>
                  <p className="text-sm text-gray-600">
                    {getPercentage(quiz.score, quiz.totalQuestions)}%
                  </p>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  <p>Player: {quiz.playerName}</p>
                  <p>Questions: {quiz.totalQuestions}</p>
                </div>
                <button
                  onClick={() => setSelectedQuiz(quiz)}
                  className="bg-[#0D9165] text-white px-6 py-2 rounded-lg hover:bg-[#0a7a52] transition-colors"
                >
                  View Answers & Explanations
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PastQuizzes;
