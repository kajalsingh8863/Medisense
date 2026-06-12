export interface ChatPart {
  text: string;
}

export interface ChatHistory {
  role: "user" | "model";
  parts: ChatPart[];
}

export interface ChatRequestBody {
  message: string;
  history: ChatHistory[];
  imageUrl?: string;
}

export interface Message {
  role: "user" | "assistant";
  content: string;
  imageUrl?: string;
  thinking?: string;
}
