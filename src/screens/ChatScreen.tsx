import { useState, useRef } from "react";
import { fetchEventSource } from "@microsoft/fetch-event-source";
import MessageComponent from "../components/MessageComponent";

type Message = {
    role: "user" | "model";
    content: string;
    imageUrl?: string;
};

export default function ChatScreen() {
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [thinking, setThinking] = useState(false);
    const [imageUrl, setImageUrl] = useState("");
    const [imagePreview, setImagePreview] = useState("");
    const [uploading, setUploading] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // useEffect(() => {
    //     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    // }, [messages, thinking]);

    const uploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;


        const localPreview = URL.createObjectURL(file);
        setImagePreview(localPreview);
        setUploading(true);
        setImageUrl("");

        const formData = new FormData();
        formData.append("image", file);

        try {
            const response = await fetch("https://medisense.sonu36437.workers.dev/api/imageUpload", {
                method: "PUT",
                body: formData,
            });
            const data = await response.json();
            setImageUrl(data.imageUrl);
        } catch (err) {
            console.error("Upload failed", err);
            setImagePreview("");
        } finally {
            setUploading(false);
        }
    };

    const clearImage = () => {
        setImageUrl("");
        setImagePreview("");
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const sendMessage = async () => {
        if (!input.trim() || loading) return;

        const currentInput = input;
        const currentImageUrl = imageUrl;
        const currentPreview = imagePreview;

        setInput("");
        setLoading(false);
        clearImage();

        const userMessage: Message = {
            role: "user",
            content: currentInput,
            imageUrl: currentPreview || undefined,
        };

        const assistantMessage: Message = {
            role: "model",
            content: "",
        };

        setMessages((prev) => [...prev, userMessage, assistantMessage]);
        setLoading(true);

        let streamedContent = "";

        try {
            await fetchEventSource("https://medisense.kajalsingh8863.workers.dev/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: currentInput,
                    history: messages.map((msg) => ({
                        role: msg.role,
                        parts: [{ text: msg.content }],
                    })),
                    imageUrl: currentImageUrl,
                }),

                async onopen(res) {
                    if (!res.ok) throw new Error(`Request failed: ${res.status}`);
                },

                onmessage(event) {
                    if (event.data === "[DONE]") return;
                    const parsed = JSON.parse(event.data);

                    if (parsed.type === "thinking") {
                        setThinking(true);
                        return;
                    }

                    if (parsed.type === "token") {
                        setThinking(false);
                        streamedContent += parsed.token;
                        setMessages((prev) => {
                            const copy = [...prev];
                            copy[copy.length - 1] = { role: "model", content: streamedContent };
                            return copy;
                        });
                        return;
                    }

                    if (parsed.type === "error") throw new Error(parsed.error);
                },

                onclose() {
                    setLoading(false);
                },

                onerror(err) {
                    setLoading(false);
                    throw err;
                },
            });
        } catch (error) {
            console.error(error);
            setMessages((prev) => [
                ...prev,
                {
                    role: "model",
                    content: error instanceof Error ? error.message : "Unknown error",
                },
            ]);
            setLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const isUploadComplete = imagePreview && imageUrl && !uploading;
    const canSend = input.trim() && !loading && (!imagePreview || isUploadComplete);

    return (
        <div className="min-h-screen bg-[#0a0a0f] text-white font-sans flex flex-col">
            {/* Header */}
            <header className="flex items-center gap-3 px-6 py-4 border-b border-white/5 bg-[#0d0d14]">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                    </svg>
                </div>
                <div>
                    <h1 className="text-base font-semibold tracking-tight text-white">MediSense</h1>
                    <p className="text-xs text-white/30 leading-none mt-0.5">Medical AI Assistant</p>
                </div>
                <div className="ml-auto flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs text-white/30">Online</span>
                </div>
            </header>


            <div className="flex-1 overflow-y-auto px-4 py-6 space-y-2">
                {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full gap-4 text-center py-20">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-400/20 to-blue-600/20 border border-cyan-500/20 flex items-center justify-center">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-cyan-400">
                                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-white/50 text-sm">Ask a medical question or upload an image</p>
                            <p className="text-white/20 text-xs mt-1">AI-powered medical insights</p>
                        </div>
                    </div>
                )}

                {messages.map((message, index) => (
                    <MessageComponent
                        key={index}
                        role={message.role}
                        content={message.content}
                        imageUrl={message.imageUrl}
                    />
                ))}

                {thinking && (
                    <div className="flex items-center gap-2 px-4 py-3">
                        {/* <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-cyan-400/60 animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
            <span className="text-xs text-white/30">Analyzing...</span> */}

                        <div className="flex items-center gap-0.5 text-zinc-400 font-medium">
                            {"thinking....".split("").map((char, index) => (
                                <span
                                    key={index}
                                    className="animate-bounce"
                                    style={{
                                        animationDelay: `${index * 0.18}s`,
                                      
                                    }}
                                >
                                    {char}
                                </span>
                            ))}
                        </div>

                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>


            <div className="border-t border-white/5 bg-[#0d0d14] px-4 py-4">

                {imagePreview && (
                    <div className="mb-3 flex items-center gap-3 px-1">
                        <div className="relative w-14 h-14 rounded-xl overflow-hidden border border-white/10 flex-shrink-0">
                            <img src={imagePreview} alt="preview" className="w-full h-full object-cover" />
                            {uploading && (
                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                    <svg className="animate-spin w-4 h-4 text-cyan-400" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                    </svg>
                                </div>
                            )}
                            {isUploadComplete && (
                                <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center">
                                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                </div>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs text-white/50 truncate">
                                {uploading ? "Uploading image..." : "Image ready to send"}
                            </p>
                            {uploading && (
                                <div className="mt-1 h-0.5 w-24 bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full bg-cyan-400 rounded-full animate-pulse w-3/4" />
                                </div>
                            )}
                        </div>
                        {!uploading && (
                            <button
                                onClick={clearImage}
                                className="text-white/20 hover:text-white/60 transition-colors p-1"
                                title="Remove image"
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        )}
                    </div>
                )}

                <div className="flex gap-2 items-end">

                    <label
                        className={`flex-shrink-0 w-10 h-10 rounded-xl border flex items-center justify-center cursor-pointer transition-all ${imagePreview
                                ? "border-white/5 text-white/15 cursor-not-allowed"
                                : "border-white/10 text-white/40 hover:border-white/20 hover:text-white/60"
                            }`}
                        title={imagePreview ? "Image already attached" : "Attach image"}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={uploadImage}
                            disabled={!!imagePreview}
                            className="hidden"
                        />
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" />
                            <polyline points="21 15 16 10 5 21" />
                        </svg>
                    </label>


                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask a medical question..."
                        rows={1}
                        className="flex-1 bg-white/5 border border-white/8 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/20 resize-none focus:outline-none focus:border-cyan-500/40 focus:bg-white/7 transition-all leading-relaxed"
                        style={{ minHeight: "42px", maxHeight: "120px" }}
                    />


                    <button
                        disabled={!canSend}
                        onClick={sendMessage}
                        className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all ${canSend
                                ? "bg-cyan-500 hover:bg-cyan-400 shadow-lg shadow-cyan-500/25 text-white"
                                : "bg-white/5 text-white/20 cursor-not-allowed"
                            }`}
                    >
                        {loading ? (
                            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                            </svg>
                        ) : (
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                            </svg>
                        )}
                    </button>
                </div>

                <p className="text-center text-[10px] text-white/15 mt-3">
                    MediSense is an AI assistant — not a substitute for professional medical advice.
                </p>
            </div>
        </div>
    );
}