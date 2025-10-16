import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

interface Question {
  question: string;
  answers: { text: string; correct: boolean }[];
  explanation?: string;
}

interface OldQuestion {
  question: string;
  options: Record<string, string>;
  answer: string;
}

// interface LeaderboardEntry {
//   name: string;
//   score: number;
//   date: string;
// }

const Quiz: React.FC = () => {
  const navigate = useNavigate();
  const [playerName, setPlayerName] = useState<string>("");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [totalTimeLeft, setTotalTimeLeft] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<number, number>
  >({});
  // Removed unused state to fix eslint warning
  const answeredRef = useRef<Set<number>>(new Set());
  const [quizFinished, setQuizFinished] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [showAnswers, setShowAnswers] = useState(false);

  // Load questions from localStorage
  useEffect(() => {
    const storedQuestions = localStorage.getItem("questions");
    if (storedQuestions) {
      const parsedQuestions = JSON.parse(storedQuestions);
      // Convert old format to new format if necessary
      const convertedQuestions = parsedQuestions.map((q: unknown) => {
        if ((q as Question).answers) return q as Question; // already new format
        const oldQ = q as OldQuestion;
        const answers = Object.entries(oldQ.options).map(([key, text]) => ({
          text,
          correct: key === oldQ.answer,
        }));
        return { question: oldQ.question, answers };
      });
      setQuestions(convertedQuestions);
    } else {
      // TODO: Handle no questions case - perhaps navigate back or show error
      toast.error("No questions found");
      navigate("/dashboard/quiz-setup"); // Or your default page
    }
  }, [navigate]);

  // Check if player name exists
  useEffect(() => {
    const name = localStorage.getItem("playerName");
    const storedTotalTime = localStorage.getItem("quizTotalTime");
    if (!name) {
      navigate("/dashboard/quiz-setup");
    } else {
      setPlayerName(name);
      if (storedTotalTime) {
        const totalTimeValue = parseInt(storedTotalTime, 10);
        setTotalTime(totalTimeValue);
        setTotalTimeLeft(totalTimeValue);
      }
      setQuizStarted(true);
    }
  }, [navigate]);

  // Set selectedIndex when question changes
  useEffect(() => {
    setSelectedIndex(selectedAnswers[currentQuestionIndex] ?? null);
  }, [currentQuestionIndex, selectedAnswers]);

  // Timer logic
  const timerRef = useRef<number | null>(null);
  const timeoutRef = useRef<number | null>(null);

  const timerCallback = useCallback(() => {
    setTotalTimeLeft((prevTime) => {
      if (prevTime <= 1) {
        finishQuiz();
        return 0;
      }
      return prevTime - 1;
    });
  }, []);

  useEffect(() => {
    if (!quizStarted || quizFinished) {
      if (timerRef.current !== null) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    // Initialize totalTimeLeft when quiz starts
    if (totalTimeLeft === 0 && questions.length > 0) {
      setTotalTimeLeft(questions.length * 10);
    }

    timerRef.current = setInterval(timerCallback, 1000);

    return () => {
      if (timerRef.current !== null) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [quizStarted, quizFinished, totalTimeLeft, questions.length, timerCallback]);

  const handleAnswerSelect = (answerIndex: number) => {
    // Prevent changing answer if already answered
    if (answeredRef.current.has(currentQuestionIndex)) {
      return;
    }

    setSelectedIndex(answerIndex);
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestionIndex]: answerIndex,
    }));

    const currentQuestion = questions[currentQuestionIndex];
    if (currentQuestion.answers[answerIndex].correct) {
      setScore((prevScore) => prevScore + 1);
    }

    // Mark question as answered
    answeredRef.current.add(currentQuestionIndex);
    // Removed setAnsweredQuestions usage as it was removed from state

    // Clear existing timeout to prevent double advancing
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    // Set a timeout to auto advance after 1 second delay
    timeoutRef.current = window.setTimeout(() => {
      handleNextQuestion();
      timeoutRef.current = null;
    }, 1000);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = () => {
    setQuizFinished(true);

    // Save completed quiz to past quizzes
    const pastQuizData = {
      id: Date.now().toString(),
      questions: questions,
      selectedAnswers: selectedAnswers,
      score: score,
      totalQuestions: questions.length,
      playerName: playerName,
      completedAt: new Date().toISOString(),
      timeTaken: totalTime - totalTimeLeft,
    };

    const existingPastQuizzes = localStorage.getItem("pastQuizzes");
    let pastQuizzes = [];

    if (existingPastQuizzes) {
      pastQuizzes = JSON.parse(existingPastQuizzes);
    }

    pastQuizzes.push(pastQuizData);

    // Keep only last 10 past quizzes to avoid storage bloat
    if (pastQuizzes.length > 10) {
      pastQuizzes = pastQuizzes.slice(-10);
    }

    localStorage.setItem("pastQuizzes", JSON.stringify(pastQuizzes));
  };

  const handleRestartQuiz = () => {
    setCurrentQuestionIndex(0);
    setScore(0);
    setTotalTimeLeft(totalTime);
    setSelectedIndex(null);
    setSelectedAnswers({});
    answeredRef.current.clear();
    // Removed setAnsweredQuestions call as state was removed
    setQuizFinished(false);
    setQuizStarted(true);
  };

  if (!quizStarted) {
    return (
      <div className="min-h-screen bg-amber-600 flex items-center justify-center text-gray-700">
        Loading...
      </div>
    );
  }

  if (quizFinished) {
    const percentage =
      questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;
    const status = percentage >= 50 ? "PASSED" : "FAILED";
    const statusColor = percentage >= 50 ? "text-green-600" : "text-red-600";
    const timeTaken = totalTime - totalTimeLeft;
    const minutes = Math.floor(timeTaken / 60);
    const seconds = timeTaken % 60;
    const formattedTime = `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;

    if (showAnswers) {
      return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg p-4 md:p-6 max-w-6xl w-full text-left max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-xl font-bold">
                Answers with Explanations
              </h1>
              <button
                onClick={() => setShowAnswers(false)}
                className="bg-[#0D9165] text-white px-4 py-2 rounded-lg hover:bg-[#0a7a52] text-sm font-medium"
              >
                Back to Results
              </button>
            </div>
            <div className="max-h-96 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {questions.map((question, index) => {
                  const userAnswerIndex = selectedAnswers[index];
                  const userAnswer =
                    userAnswerIndex !== undefined
                      ? question.answers[userAnswerIndex]
                      : null;
                  const correctAnswer = question.answers.find(
                    (ans) => ans.correct
                  );
                  return (
                    <div key={index} className="p-3 border rounded-lg bg-gray-50">
                      <h3 className="font-semibold mb-2 text-sm">
                        {index + 1}. {question.question}
                      </h3>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm">
                          Your answer:{" "}
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
                          Correct answer:{" "}
                          <span className="text-green-600 font-semibold">
                            {correctAnswer?.text}
                          </span>
                        </p>
                      </div>
                      {/* Assuming explanation is part of the question object, e.g. question.explanation */}
                      {question.explanation && (
                        <p className="mt-2 text-gray-700 italic text-sm">
                          Explanation: {question.explanation}
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
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-6 md:p-12 max-w-md w-full text-center">
          <h1 className="text-2xl font-bold mb-4">Planets</h1>
          <p className="text-2xl font-bold mb-2">
            Your result:{" "}
            <span className="text-green-700">
              {score}/{questions.length} points ({percentage}%)
            </span>
          </p>
          <p className={`mb-2 font-semibold ${statusColor}`}>
            Status: {status}
          </p>
          <p className="mb-4">Time: {formattedTime}</p>
          <p className="mb-6">
            Congratulations, you've successfully{" "}
            {status === "PASSED" ? "passed" : "completed"} the test.
          </p>
          <div className="space-y-4">
            <button
              onClick={() => setShowAnswers(true)}
              className="md:text-[18px] md:px-5 py-1.5 px-7 md:py-1 lg:py-2
              lg:px-9  rounded-md font-[400] text-[20px] cursor-pointer bg-[#0d9165] font-inter text-[white]
        hover:rounded-[30px] hover:bg-white hover:text-[#0d9165] border hover:border-[#0d9165]
        transition-all duration-150 ease-in-out"
            >
              Show Answers
            </button>
            <button
              onClick={handleRestartQuiz}
              className="md:text-[18px] md:px-5 py-1.5 px-7 md:py-1 lg:py-2
              lg:px-9  rounded-md font-[400] text-[20px] cursor-pointer bg-[#0d9165] font-inter text-[white]
        hover:rounded-[30px] hover:bg-white hover:text-[#0d9165] border hover:border-[#0d9165]
        transition-all duration-150 ease-in-out"
            >
              Restart Quiz
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6 max-w-3xl w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Question {currentQuestionIndex + 1} of {questions.length}
          </h2>
          <div className="flex items-center space-x-6 text-gray-700 font-semibold">
            <span>Player: {playerName}</span>
            <span>Score: {score}</span>
          </div>
        </div>

        <div className="mb-6 flex items-center space-x-4">
          <div className="flex-1 h-2 bg-gray-300 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#17B883] transition-all duration-1000 ease-linear"
              style={{
                width: `${
                  totalTime > 0 ? (totalTimeLeft / totalTime) * 100 : 0
                }%`,
              }}
            />
          </div>
          <div className="flex items-center bg-[#DFF6E4] text-[#17B883] rounded-full px-3 py-1 text-sm font-semibold select-none">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {totalTimeLeft}s
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-4 text-gray-900">
            {currentQuestion.question}
          </h3>

          <div className="grid grid-cols-1 gap-2">
            {currentQuestion.answers.map((ans, idx) => {
              const isSelected = selectedIndex === idx;
              const isAnswered = answeredRef.current.has(currentQuestionIndex);

              let classes =
                "w-full text-sm md:text-base font-medium px-3 py-1.5 rounded-lg border transition-all duration-200";

              if (isAnswered) {
                // After selecting, show correct and wrong colors
                if (ans.correct) {
                  classes += " bg-green-100 border-green-500 text-green-800";
                } else if (isSelected && !ans.correct) {
                  classes += " bg-red-100 border-red-500 text-red-800";
                } else {
                  classes += " bg-gray-100 text-gray-600";
                }
              } else {
                // Default state (before selection)
                classes +=
                  " bg-white text-gray-900 hover:bg-[#0d9165] hover:text-white border-gray-300";
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleAnswerSelect(idx)}
                  disabled={isAnswered}
                  className={classes}
                >
                  {ans.text}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex justify-between items-center mt-4 gap-4">
          <button
            className="bg-[#17B883] text-white cursor-pointer font-bold px-4 py-1 h-10 rounded-full transition-colors duration-300 text-sm hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed w-32"
            onClick={() => {
              // Clear any pending timeout
              if (timeoutRef.current !== null) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
              }
              if (currentQuestionIndex > 0) {
                setCurrentQuestionIndex(currentQuestionIndex - 1);
              }
            }}
            disabled={currentQuestionIndex === 0}
          >
            Previous
          </button>

          <button
            className="bg-[#084430] cursor-pointer text-white font-bold px-4 py-1 h-10 rounded-full transition-colors duration-300 text-sm hover:bg-[#0D9165] w-32"
            onClick={() => {
              // Clear any pending timeout
              if (timeoutRef.current !== null) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
              }
              if (currentQuestionIndex < questions.length - 1) {
                setCurrentQuestionIndex(currentQuestionIndex + 1);
              } else {
                finishQuiz();
              }
            }}
            disabled={quizFinished}
          >
            {currentQuestionIndex < questions.length - 1
              ? "Next Question"
              : "Finish Quiz"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Quiz;
