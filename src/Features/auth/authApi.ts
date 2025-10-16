// src/Redux/api.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  User,
} from "../Types/types";

// ✅ Shared base URL for both APIs
const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_BASE_URL,
  prepareHeaders: (headers) => {
    const token = localStorage.getItem("token");
    if (token) headers.set("authorization", `Bearer ${token}`);
    return headers;
  },
});

//
// ==================== AUTH API ====================
//
export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery,
  endpoints: (builder) => ({
    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (credentials) => ({
        url: "/loginUser",
        method: "POST",
        body: credentials,
      }),
    }),

    register: builder.mutation<{ message: string }, RegisterRequest>({
      query: (userData) => ({
        url: "/signUp",
        method: "POST",
        body: userData,
      }),
    }),

    updateUserProfile: builder.mutation<
      { message: string; data: User },
      {
        id: string;
        fullName?: string;
        email?: string;
        password?: string;
        currentPassword?: string;
      }
    >({
      query: ({ id, ...body }) => ({
        url: `/update/${id}`,
        method: "PATCH",
        body,
      }),
    }),

    logout: builder.mutation<{ message: string }, void>({
      query: () => ({
        url: "/logout",
        method: "POST",
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useUpdateUserProfileMutation,
  useLogoutMutation,
} = authApi;

//
// ==================== REMINDER API ====================
//
export interface Reminder {
  _id: string;
  title: string;
  datetime: string;
  createdAt: string;
  lastSeen?: string;
}

export const reminderApi = createApi({
  reducerPath: "reminderApi",
  baseQuery,
  tagTypes: ["Reminders", "Activities"],

  endpoints: (builder) => ({
    // GET /reminders
    getReminders: builder.query<Reminder[], void>({
      query: () => "/reminders",
      providesTags: ["Reminders"],
    }),

    // PUT /reminders/:id/seen
    markSeen: builder.mutation<void, string>({
      query: (id) => ({
        url: `/reminders/${id}/seen`,
        method: "PUT",
      }),
      invalidatesTags: ["Reminders", "Activities"],
    }),

    // DELETE /reminders/:id
    deleteReminder: builder.mutation<void, string>({
      query: (id) => ({
        url: `/reminders/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Reminders", "Activities"],
    }),

    // POST /reminders
    addReminder: builder.mutation<{ message: string; reminder: Reminder }, { title: string; datetime: string }>({
      query: (reminder) => ({
        url: "/reminders",
        method: "POST",
        body: reminder,
      }),
      invalidatesTags: ["Reminders", "Activities"],
    }),

    // PUT /reminders/:id
    updateReminder: builder.mutation<{ message: string; reminder: Reminder }, { id: string; title: string; datetime: string }>({
      query: ({ id, ...body }) => ({
        url: `/reminders/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Reminders", "Activities"],
    }),

    // POST /reminders/reset
    resetSample: builder.mutation<void, void>({
      query: () => ({
        url: "/reminders/reset",
        method: "POST",
      }),
      invalidatesTags: ["Reminders", "Activities"],
    }),
  }),
});

export const {
  useGetRemindersQuery,
  useMarkSeenMutation,
  useDeleteReminderMutation,
  useAddReminderMutation,
  useUpdateReminderMutation,
  useResetSampleMutation,
} = reminderApi;

//
// ==================== ACTIVITY API ====================
//
import type { Activity } from "../Types/types";

export const activityApi = createApi({
  reducerPath: "activityApi",
  baseQuery,
  tagTypes: ["Activities"],
  endpoints: (builder) => ({
    // GET /activities
    getActivities: builder.query<Activity[], void>({
      query: () => "/activities",
      providesTags: ["Activities"],
    }),
    // DELETE /activities/:id
    deleteActivity: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/activities/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Activities"],
    }),
    // DELETE /activities/clear-all
    clearAllActivities: builder.mutation<{ message: string }, void>({
      query: () => ({
        url: "/activities/clear-all",
        method: "DELETE",
      }),
      invalidatesTags: ["Activities"],
    }),
  }),
});

export const {
  useGetActivitiesQuery,
  useDeleteActivityMutation,
  useClearAllActivitiesMutation,
} = activityApi;

//
// ==================== QUIZ API ====================
//
import type { Quiz, GenerateQuizRequest } from "../Types/types";

export const quizApi = createApi({
  reducerPath: "quizApi",
  baseQuery,
  tagTypes: ["Quizzes"],
  endpoints: (builder) => ({
    generateQuiz: builder.mutation<{ message: string; data: Quiz }, GenerateQuizRequest>({
      query: ({ file, ...body }) => {
        const formData = new FormData();
        formData.append("topic", body.topic);
        formData.append("difficulty", body.difficulty);
        formData.append("numQuestions", body.numQuestions.toString());
        if (file) formData.append("file", file);
        return {
          url: "/quiz",
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: ["Quizzes"],
    }),
    getAllQuizzes: builder.query<{ message: string; data: Quiz[] }, void>({
      query: () => "/quiz/history",
      providesTags: ["Quizzes"],
    }),
    getQuizById: builder.query<{ message: string; data: Quiz }, string>({
      query: (id) => `/quiz/${id}`,
    }),
  }),
});

export const {
  useGenerateQuizMutation,
  useGetAllQuizzesQuery,
  useGetQuizByIdQuery,
} = quizApi;

//
// ==================== CHAT API ====================
//
import type { Chat, CreateChatRequest, SendMessageRequest } from "../Types/types";

export const chatApi = createApi({
  reducerPath: "chatApi",
  baseQuery,
  tagTypes: ["Chats"],
  endpoints: (builder) => ({
    createChat: builder.mutation<Chat, CreateChatRequest>({
      query: (body) => ({
        url: "/chat",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Chats"],
    }),
    sendMessage: builder.mutation<{ message: string }, SendMessageRequest>({
      query: ({ chatId, file, ...body }) => {
        const formData = new FormData();
        formData.append("message", body.message);
        formData.append("chatId", chatId);
        if (file) formData.append("file", file);
        return {
          url: "/chat/message",
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: ["Chats"],
    }),
    getChats: builder.query<Chat[], void>({
      query: () => "/chat",
      providesTags: ["Chats"],
    }),
    getChat: builder.query<Chat, string>({
      query: (id) => `/chat/${id}`,
    }),
    deleteChat: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/chat/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Chats"],
    }),
  }),
});

export const {
  useCreateChatMutation,
  useSendMessageMutation,
  useGetChatsQuery,
  useGetChatQuery,
  useDeleteChatMutation,
} = chatApi;

//
// ==================== UPLOAD API ====================
//
import type { FileUpload } from "../Types/types";

export const uploadApi = createApi({
  reducerPath: "uploadApi",
  baseQuery,
  tagTypes: ["Files"],
  endpoints: (builder) => ({
    uploadFiles: builder.mutation<{ message: string; data: FileUpload[] }, { files: File[] }>({
      query: ({ files }) => {
        const formData = new FormData();
        files.forEach((file) => formData.append("files", file));
        return {
          url: "/upload",
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: ["Files"],
    }),
    getFiles: builder.query<{ message: string; data: FileUpload[] }, void>({
      query: () => "/files",
      providesTags: ["Files"],
    }),
    deleteFile: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/files/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Files"],
    }),
  }),
});

export const {
  useUploadFilesMutation,
  useGetFilesQuery,
  useDeleteFileMutation,
} = uploadApi;
