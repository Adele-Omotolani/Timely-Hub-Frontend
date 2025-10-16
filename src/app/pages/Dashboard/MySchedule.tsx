import React, { useState, useMemo } from "react";

interface TimetableProps {
  title?: string;
  onNewSheet?: () => void;
}

interface TimeSubjectEntry {
  id: string;
  time: string;
  subject: string;
}

interface DaySchedule {
  id: number;
  name: string;
  entries: TimeSubjectEntry[];
  isExpanded: boolean;
}

const MySchedule: React.FC<TimetableProps> = () => {
  const [days, setDays] = useState<DaySchedule[]>([
    { id: 1, name: "Mon", entries: [], isExpanded: false },
    { id: 2, name: "Tue", entries: [], isExpanded: false },
    { id: 3, name: "Wed", entries: [], isExpanded: false },
    { id: 4, name: "Thu", entries: [], isExpanded: false },
    { id: 5, name: "Fri", entries: [], isExpanded: false },
    { id: 6, name: "Sat", entries: [], isExpanded: false },
  ]);

  const [searchQuery, setSearchQuery] = useState("");

  const colors = {
    primary: "bg-[#0D9165]",
    primaryHover: "hover:bg-[#0a7a54]",
    secondary: "bg-[#f0fdf4]",
    textPrimary: "text-white",
    textSecondary: "text-gray-700",
    border: "border-[#0D9165]",
    cardBg: "bg-white",
  };

  // Filter days based on search query
  const filteredDays = useMemo(() => {
    if (!searchQuery.trim()) {
      return days;
    }

    const query = searchQuery.toLowerCase().trim();

    return days
      .map((day) => ({
        ...day,
        entries: day.entries.filter(
          (entry) =>
            entry.subject.toLowerCase().includes(query) ||
            entry.time.toLowerCase().includes(query) ||
            day.name.toLowerCase().includes(query)
        ),
      }))
      .filter(
        (day) =>
          // Keep day if it has matching entries OR if day name matches
          day.entries.length > 0 || day.name.toLowerCase().includes(query)
      );
  }, [days, searchQuery]);

  const toggleDayExpansion = (dayId: number) => {
    setDays((prevDays) =>
      prevDays.map((day) =>
        day.id === dayId ? { ...day, isExpanded: !day.isExpanded } : day
      )
    );
  };

  const addNewEntry = (dayId: number) => {
    setDays((prevDays) =>
      prevDays.map((day) =>
        day.id === dayId
          ? {
              ...day,
              entries: [
                ...day.entries,
                {
                  id: `${dayId}-${Date.now()}`,
                  time: "",
                  subject: "",
                },
              ],
            }
          : day
      )
    );
  };

  const updateEntry = (
    dayId: number,
    entryId: string,
    field: "time" | "subject",
    value: string
  ) => {
    setDays((prevDays) =>
      prevDays.map((day) =>
        day.id === dayId
          ? {
              ...day,
              entries: day.entries.map((entry) =>
                entry.id === entryId ? { ...entry, [field]: value } : entry
              ),
            }
          : day
      )
    );
  };

  const removeEntry = (dayId: number, entryId: string) => {
    setDays((prevDays) =>
      prevDays.map((day) =>
        day.id === dayId
          ? {
              ...day,
              entries: day.entries.filter((entry) => entry.id !== entryId),
            }
          : day
      )
    );
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);

    // Auto-expand days when searching to show results
    if (query.trim()) {
      setDays((prevDays) =>
        prevDays.map((day) => ({
          ...day,
          isExpanded: true,
        }))
      );
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
  };

  // Calculate summary for filtered days
  const totalSubjects = filteredDays.reduce(
    (total, day) => total + day.entries.length,
    0
  );
  const daysWithSubjects = filteredDays.filter(
    (day) => day.entries.length > 0
  ).length;

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Fixed Header Section */}
      <div className="flex-shrink-0 bg-white p-4 border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto w-full">
          {/* Search Bar */}
          <div className="flex items-center relative">
            <input
              type="text"
              placeholder="Search schedules"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full px-4 py-3 pr-10 rounded-full bg-gray-100 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0D9165] focus:border-transparent text-base"
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-3 text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
            {!searchQuery && (
              <div className="absolute right-3 text-gray-400">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            )}
          </div>

          {/* Search Results Info */}
          {searchQuery && (
            <div className="mt-2 text-sm text-gray-600">
              {filteredDays.length > 0 ? (
                <span>
                  Found {totalSubjects} subject{totalSubjects !== 1 ? "s" : ""}{" "}
                  across {daysWithSubjects} day
                  {daysWithSubjects !== 1 ? "s" : ""}
                </span>
              ) : (
                <span>No results found for "{searchQuery}"</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Scrollable Content Section */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto w-full p-4">
          {/* Days Grid - Always 3 Columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-4">
            {filteredDays.map((day) => (
              <div
                key={day.id}
                className={`rounded-xl shadow-lg border ${
                  colors.border
                } overflow-hidden transition-all duration-300 ${
                  day.isExpanded ? "ring-2 ring-[#0D9165]" : ""
                } ${
                  searchQuery && day.entries.length === 0 ? "opacity-50" : ""
                }`}
              >
                {/* Day Header */}
                <div
                  className={`${colors.primary} p-4 cursor-pointer transition-colors duration-200 ${colors.primaryHover}`}
                  onClick={() => toggleDayExpansion(day.id)}
                >
                  <div className="flex items-center justify-between">
                    <h3
                      className={`text-lg font-semibold ${colors.textPrimary}`}
                    >
                      {day.name}
                      {searchQuery && day.entries.length === 0 && (
                        <span className="text-xs ml-2 opacity-75">
                          (No matches)
                        </span>
                      )}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`text-sm ${colors.textPrimary} bg-[#0a7a54] px-2 py-1 rounded-full`}
                      >
                        {day.entries.length}{" "}
                        {day.entries.length === 1 ? "subject" : "subjects"}
                      </span>
                      <svg
                        className={`w-5 h-5 ${
                          colors.textPrimary
                        } transition-transform duration-200 ${
                          day.isExpanded ? "rotate-180" : ""
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Expanded Content */}
                {day.isExpanded && (
                  <div
                    className={`${colors.cardBg} p-4 space-y-3 max-h-80 overflow-y-auto`}
                  >
                    {/* Existing Entries */}
                    {day.entries.map((entry, index) => (
                      <div
                        key={entry.id}
                        className="border border-gray-200 rounded-lg p-3 bg-gray-50 space-y-2 animate-fadeIn"
                      >
                        <div className="flex justify-between items-start">
                          <span className="text-xs text-gray-500 font-medium">
                            Subject {index + 1}
                          </span>
                          <button
                            onClick={() => removeEntry(day.id, entry.id)}
                            className="text-red-500 hover:text-red-700 transition-colors duration-200 p-1"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        </div>

                        <div className="space-y-2">
                          <input
                            type="text"
                            placeholder="Time (e.g., 8:00-9:30)"
                            value={entry.time}
                            onChange={(e) =>
                              updateEntry(
                                day.id,
                                entry.id,
                                "time",
                                e.target.value
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#0D9165] focus:border-[#0D9165]"
                          />
                          <input
                            type="text"
                            placeholder="Subject"
                            value={entry.subject}
                            onChange={(e) =>
                              updateEntry(
                                day.id,
                                entry.id,
                                "subject",
                                e.target.value
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#0D9165] focus:border-[#0D9165]"
                          />
                        </div>
                      </div>
                    ))}

                    {/* Add New Entry Button */}
                    <button
                      onClick={() => addNewEntry(day.id)}
                      className={`w-full py-3 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center space-x-2 text-gray-600 hover:text-[#0D9165] hover:border-[#0D9165] transition-all duration-200 group`}
                    >
                      <svg
                        className="w-5 h-5 group-hover:scale-110 transition-transform duration-200"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      <span className="font-medium">Add Time Slot</span>
                    </button>

                    {/* Empty State */}
                    {day.entries.length === 0 && (
                      <div className="text-center py-6 text-gray-500">
                        <svg
                          className="w-12 h-12 mx-auto mb-2 opacity-50"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <p className="text-sm">
                          {searchQuery
                            ? "No matching time slots"
                            : "No time slots added yet"}
                        </p>
                        <p className="text-xs mt-1">
                          {searchQuery
                            ? "Try a different search term"
                            : "Click 'Add Time Slot' to get started"}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Collapsed Preview */}
                {!day.isExpanded && day.entries.length > 0 && (
                  <div className={`${colors.cardBg} p-4`}>
                    <div className="space-y-2">
                      {day.entries.slice(0, 2).map((entry) => (
                        <div
                          key={entry.id}
                          className="flex justify-between items-center text-sm"
                        >
                          <span className="font-medium text-gray-700 truncate flex-1 pr-2">
                            {entry.subject || "Untitled"}
                          </span>
                          <span className="text-gray-500 text-xs flex-shrink-0 bg-gray-100 px-2 py-1 rounded">
                            {entry.time || "No time"}
                          </span>
                        </div>
                      ))}
                      {day.entries.length > 2 && (
                        <div className="text-center text-xs text-gray-500 pt-2 bg-gray-50 py-1 rounded">
                          +{day.entries.length - 2} more subjects
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Summary Section */}
          <div className="mt-6 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                <span className="text-sm text-gray-600 font-medium">
                  Total subjects: {totalSubjects}
                </span>
                <span className="text-sm text-gray-600 font-medium">
                  Days with subjects: {daysWithSubjects} / {filteredDays.length}
                </span>
                {searchQuery && (
                  <span className="text-sm text-blue-600 font-medium">
                    Searching: "{searchQuery}"
                  </span>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setDays((prevDays) =>
                      prevDays.map((day) => ({ ...day, isExpanded: true }))
                    );
                  }}
                  className="px-4 py-2 bg-[#0D9165] text-white rounded-md hover:bg-[#0a7a54] transition-colors duration-200 text-sm font-medium"
                >
                  Expand All
                </button>
                <button
                  onClick={() => {
                    setDays((prevDays) =>
                      prevDays.map((day) => ({ ...day, isExpanded: false }))
                    );
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors duration-200 text-sm font-medium"
                >
                  Collapse All
                </button>
                {searchQuery && (
                  <button
                    onClick={clearSearch}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors duration-200 text-sm font-medium"
                  >
                    Clear Search
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MySchedule;
