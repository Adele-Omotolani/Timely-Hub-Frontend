import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import ProfileDropdown from "../../pages/Dashboard/profile";
import Button from "../../../Components/Button";
import {
  useAddReminderMutation,
  useGetRemindersQuery,
  useUpdateReminderMutation,
  useDeleteReminderMutation,
} from "../../../Features/auth/authApi";

const RightBar: React.FC = () => {
  interface StudyEvent {
    id: string;
    title: string;
    time: string;
    type: "class" | "study" | "assignment" | "others";
    date: string;
  }

  interface EventsByDate {
    [key: string]: StudyEvent[];
  }

  const formatDateKey = (date: Date): string =>
    date.toISOString().split("T")[0];

  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingEvent, setEditingEvent] = useState<StudyEvent | null>(null);
  const [newEvent, setNewEvent] = useState<{
    title: string;
    time: string;
    date: string;
    type: "class" | "study" | "assignment" | "others";
  }>({
    title: "",
    time: getRoundedTime(),
    date: getTodayDateString(),
    type: "class",
  });
  const [error, setError] = useState<string>("");
  const modalRef = useRef<HTMLDivElement>(null);

  const {
    data: reminders,
    isLoading: isLoadingReminders,
    error: remindersError,
  } = useGetRemindersQuery();
  const [addReminder, { isLoading: isAdding }] = useAddReminderMutation();
  const [updateReminder, { isLoading: isUpdating }] =
    useUpdateReminderMutation();
  const [deleteReminder, { isLoading: isDeleting }] =
    useDeleteReminderMutation();

  // Transform reminders to events
  const events: EventsByDate = useMemo(() => {
    const eventsByDate: EventsByDate = {};
    if (reminders) {
      reminders.forEach((reminder) => {
        try {
          const datetime = new Date(reminder.datetime);
          if (isNaN(datetime.getTime())) {
            console.warn(
              `Invalid datetime for reminder ${reminder._id}: ${reminder.datetime}`
            );
            return;
          }
          const date = datetime.toISOString().split("T")[0];
          const time = datetime.toTimeString().slice(0, 5);
          const event: StudyEvent = {
            id: reminder._id,
            title: reminder.title,
            time,
            date,
            type: "others",
          };
          if (!eventsByDate[date]) {
            eventsByDate[date] = [];
          }
          eventsByDate[date].push(event);
        } catch (error) {
          console.error(`Error processing reminder ${reminder._id}:`, error);
        }
      });
    }
    return eventsByDate;
  }, [reminders]);

  // Get current time rounded to nearest 15 minutes
  function getRoundedTime(): string {
    const now = new Date();
    const minutes = now.getMinutes();
    const roundedMinutes = Math.ceil(minutes / 15) * 15;
    now.setMinutes(roundedMinutes);
    now.setSeconds(0);
    return now.toTimeString().slice(0, 5);
  }

  // Get today's date as YYYY-MM-DD string
  function getTodayDateString(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  // Convert any date to YYYY-MM-DD string
  function dateToString(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  // Convert YYYY-MM-DD string back to Date object
  function stringToDate(dateString: string): Date {
    const parts = dateString.split("-");
    const year = Number(parts[0]);
    const month = Number(parts[1]) - 1;
    const day = Number(parts[2]);
    return new Date(year, month, day);
  }

  // Check if selected date/time is in the past
  function isEventInPast(eventDate: string, eventTime: string): boolean {
    const selectedDate = stringToDate(eventDate);
    const [hours, minutes] = eventTime.split(":").map(Number);
    selectedDate.setHours(hours, minutes, 0, 0);
    const now = new Date();
    return selectedDate < now;
  }

  const month = currentDate.toLocaleString("default", { month: "short" });
  const year = currentDate.getFullYear();

  const handleCloseModal = useCallback((): void => {
    setShowModal(false);
    setEditingEvent(null);
    setNewEvent({
      title: "",
      time: getRoundedTime(),
      date: formatDateKey(selectedDate),
      type: "class",
    });
    setError("");
  }, [selectedDate]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        handleCloseModal();
      }
    };

    if (showModal) {
      document.addEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "unset";
    };
  }, [showModal, handleCloseModal]);

  // Get all days in current month for calendar
  const getCalendarDays = (): (Date | null)[] => {
    const firstDay = new Date(year, currentDate.getMonth(), 1);
    const lastDay = new Date(year, currentDate.getMonth() + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    return [
      ...Array(startingDay).fill(null),
      ...Array.from(
        { length: daysInMonth },
        (_, i) => new Date(year, currentDate.getMonth(), i + 1)
      ),
    ];
  };

  // Check if a date has events
  const hasEventsOnDate = (date: Date): boolean =>
    !!events[dateToString(date)]?.length;

  // Check if date is today
  const isToday = (date: Date): boolean =>
    date.toDateString() === new Date().toDateString();

  // Check if date is currently selected
  const isSelectedDate = (date: Date): boolean =>
    date.toDateString() === selectedDate.toDateString();

  // Save new event or update existing one
  const saveEvent = async (): Promise<void> => {
    if (!newEvent.title.trim()) {
      setError("Please input event title");
      return;
    }

    if (isEventInPast(newEvent.date, newEvent.time)) {
      setError(
        "Cannot add events in the past. Please select a future date and time."
      );
      return;
    }

    const datetime = new Date(
      `${newEvent.date}T${newEvent.time}`
    ).toISOString();

    try {
      if (editingEvent) {
        await updateReminder({
          id: editingEvent.id,
          title: newEvent.title.trim(),
          datetime,
        }).unwrap();
      } else {
        await addReminder({ title: newEvent.title.trim(), datetime }).unwrap();
      }
      handleCloseModal();
    } catch (err: unknown) {
      const errorMessage =
        (err as { data?: { message?: string } })?.data?.message ||
        "Failed to save event";
      setError(errorMessage);
    }
  };

  // Click on event in list to select its date
  const selectEventDate = (eventDate: string): void => {
    const date = stringToDate(eventDate);
    setSelectedDate(date);
    setCurrentDate(new Date(date.getFullYear(), date.getMonth(), 1));
  };

  // Edit an existing event
  const startEditingEvent = (event: StudyEvent, e: React.MouseEvent): void => {
    e.stopPropagation();
    setEditingEvent(event);
    setNewEvent({
      title: event.title,
      time: event.time,
      date: event.date,
      type: event.type,
    });
    setShowModal(true);
    setError("");
  };

  // Delete an event
  const handleDeleteEvent = async (
    event: StudyEvent,
    e: React.MouseEvent
  ): Promise<void> => {
    e.stopPropagation();
    try {
      await deleteReminder(event.id).unwrap();
    } catch (err: unknown) {
      console.error("Failed to delete event:", err);
    }
  };

  // Format date as "Today", "Tomorrow", or "Mon 15"
  const formatDisplayDate = (dateString: string): string => {
    const date = stringToDate(dateString);
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow";
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
  };

  // Get all events sorted by date and time
  const allEvents = Object.entries(events)
    .flatMap(([date, events]) => events.map((event) => ({ ...event, date })))
    .sort((a, b) => {
      const dateA = stringToDate(a.date);
      const [hoursA, minutesA] = a.time.split(":").map(Number);
      dateA.setHours(hoursA, minutesA, 0, 0);

      const dateB = stringToDate(b.date);
      const [hoursB, minutesB] = b.time.split(":").map(Number);
      dateB.setHours(hoursB, minutesB, 0, 0);

      return dateA.getTime() - dateB.getTime();
    });

  const calendarDays = getCalendarDays();
  const dayNames = ["S", "M", "T", "W", "T", "F", "S"];

  if (isLoadingReminders) {
    return (
      <div className="bg-white shadow-sm border border-gray-100 p-3 w-[18%] text-xs text-gray-900">
        Loading...
      </div>
    );
  }

  if (remindersError) {
    return (
      <div className="bg-white shadow-sm border border-gray-100 p-3 w-[18%] text-xs text-gray-900">
        Error loading reminders
      </div>
    );
  }

  return (
    <div className="bg-white shadow-sm border border-gray-100 p-3 w-[18%] text-xs text-gray-900 transition-colors duration-200">
      <div className="flex justify-between items-center mb-3">
        <ProfileDropdown />
      </div>

      <div className="flex justify-between items-center mb-3">
        <div className="font-poppins font-semibold text-[#102844]">
          {month} {year}
        </div>
        <div className="flex gap-1">
          <button
            onClick={() =>
              setCurrentDate(new Date(year, currentDate.getMonth() - 1, 1))
            }
            className="w-5 h-5 flex items-center justify-center bg-gray-50 rounded text-[#102844] hover:bg-[#0D9165] hover:text-white"
          >
            ‹
          </button>
          <button
            onClick={() =>
              setCurrentDate(new Date(year, currentDate.getMonth() + 1, 1))
            }
            className="w-5 h-5 flex items-center justify-center bg-gray-50 rounded text-[#102844] hover:bg-[#0D9165] hover:text-white"
          >
            ›
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-0.5 mb-3">
        {dayNames.map((day, index) => (
          <div
            key={`${day}-${index}`}
            className="text-center font-semibold text-[#767278] py-1 text-[10px]"
          >
            {day}
          </div>
        ))}

        {calendarDays.map((day, i) =>
          day ? (
            <div
              key={i}
              className={`aspect-square flex items-center justify-center rounded text-[10px] cursor-pointer transition-all
                ${isToday(day) ? "border border-[#0D9165]" : ""}
                ${
                  isSelectedDate(day)
                    ? "bg-[#0D9165] text-white"
                    : "bg-gray-50 hover:bg-gray-100"
                }
              `}
              onClick={() => setSelectedDate(day)}
            >
              <div className="flex flex-col items-center">
                <span>{day.getDate()}</span>
                {hasEventsOnDate(day) && (
                  <div
                    className={`w-1 h-1 rounded-full mt-0.5 ${
                      isSelectedDate(day) ? "bg-white" : "bg-[#0D9165]"
                    }`}
                  />
                )}
              </div>
            </div>
          ) : (
            <div key={i} className="aspect-square" />
          )
        )}
      </div>

      <div className="border-t border-gray-100 pt-2">
        <div className="text-[#102844] font-medium mb-2">
          {selectedDate.getDate()}{" "}
          {selectedDate.toLocaleString("default", { month: "short" })}
        </div>

        <div className="mb-3 ml-4">
          <Button
            text="+ Add Event"
            onClick={() => {
              setEditingEvent(null);
              setNewEvent({
                title: "",
                time: getRoundedTime(),
                date: dateToString(selectedDate),
                type: "class",
              });
              setShowModal(true);
              setError("");
            }}
          />

          <p className="text-[16px] mb-1 mt-3">Upcoming Event</p>
        </div>

        <div
          className={
            allEvents.length > 3 ? "max-h-[180px] overflow-y-auto" : ""
          }
        >
          {allEvents.map((event) => (
            <div
              key={event.id}
              className="flex items-center gap-2 p-1 py-3 bg-[#0D9165] text-white rounded mb-1 cursor-pointer hover:bg-[#0D9165] transition-colors group relative"
              onClick={() => selectEventDate(event.date)}
            >
              <div className="flex-1 min-w-0">
                <div className="truncate text-xs">
                  {event.time} {event.title}
                </div>
                <div className="text-[10px] text-gray-200">
                  {formatDisplayDate(event.date)}
                </div>
              </div>

              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => startEditingEvent(event, e)}
                  className="w-5 h-5 rounded text-white flex items-center justify-center text-[10px] hover:bg-white hover:text-[#0D9165]"
                >
                  ✏️
                </button>
                <button
                  onClick={(e) => handleDeleteEvent(event, e)}
                  disabled={isDeleting}
                  className="w-5 h-5 rounded text-white flex items-center justify-center text-[10px] hover:bg-white hover:text-[#0D9165] disabled:opacity-50"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>

        {allEvents.length === 0 && (
          <div className="text-center text-gray-500 text-xs py-2">
            No upcoming events
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div
            ref={modalRef}
            className="bg-white rounded-xl shadow-lg p-6 text-center max-w-sm w-full"
          >
            <h3 className="font-semibold text-gray-800 mb-4">
              {editingEvent ? "Edit Event" : "Add Event"}
            </h3>

            <div className="space-y-3">
              <div>
                <input
                  type="text"
                  placeholder="Event title"
                  value={newEvent.title}
                  onChange={(e) => {
                    setNewEvent((prev) => ({ ...prev, title: e.target.value }));
                    if (error) setError("");
                  }}
                  className={`w-full p-2 border rounded text-sm ${
                    error ? "border-red-500" : "border-gray-200"
                  }`}
                />
                {error && (
                  <p className="text-red-500 text-xs mt-1 text-left">{error}</p>
                )}
              </div>

              <div className="flex gap-2">
                <input
                  type="date"
                  value={newEvent.date}
                  onChange={(e) =>
                    setNewEvent((prev) => ({ ...prev, date: e.target.value }))
                  }
                  min={getTodayDateString()}
                  className="flex-1 p-2 border border-gray-200 rounded text-sm cursor-pointer"
                />
                <input
                  type="time"
                  value={newEvent.time}
                  onChange={(e) =>
                    setNewEvent((prev) => ({ ...prev, time: e.target.value }))
                  }
                  className="flex-1 p-2 border border-gray-200 rounded text-sm cursor-pointer"
                />
              </div>

              <select
                value={newEvent.type}
                onChange={(e) =>
                  setNewEvent((prev) => ({
                    ...prev,
                    type: e.target.value as
                      | "class"
                      | "study"
                      | "assignment"
                      | "others",
                  }))
                }
                className="w-full p-2 border border-gray-200 rounded text-sm cursor-pointer"
              >
                <option value="class">Class</option>
                <option value="study">Study</option>
                <option value="assignment">Assignment</option>
                <option value="others">Others</option>
              </select>
            </div>

            <div className="mt-6 flex gap-4 justify-center">
              <button
                onClick={handleCloseModal}
                className="px-5 py-2 rounded-md border border-[#0D9165] text-[#0D9165] hover:bg-green-50 transition w-full sm:w-auto"
              >
                Cancel
              </button>
              <button
                onClick={saveEvent}
                disabled={isAdding || isUpdating}
                className="px-6 py-2 rounded-md bg-[#0D9165] text-white hover:bg-[#17B883] transition duration-200 w-full sm:w-auto disabled:opacity-50"
              >
                {editingEvent ? "Update" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RightBar;
