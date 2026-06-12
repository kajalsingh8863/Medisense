
import ReactMarkdown from "react-markdown";

interface MessageProps {
  role: "user" | "assistant" | "model";
  content: string;
  imageUrl?: string;
}

export default function MessageComponent({ role, content, imageUrl }: MessageProps) {
  const isAssistant = role === "assistant" || role === "model";

  return (
    <div className={`flex w-full mb-3 ${isAssistant ? "justify-start" : "justify-end"}`}>
      {isAssistant && (
        <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center mr-2 mt-0.5 shadow-md shadow-cyan-500/20">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
          </svg>
        </div>
      )}

      <div className={`max-w-[78%] flex flex-col gap-2 ${isAssistant ? "items-start" : "items-end"}`}>
      
        {imageUrl && (
          <div className={`rounded-2xl border ${
            isAssistant
              ? "border-white/8"
              : "border-cyan-500/20"
          }`}>
            <img
              src={imageUrl}
              alt="Attached"
              className="object-cover block"
            />
          </div>
        )}


        {content && (
          <div
            className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
              isAssistant
                ? "bg-white/5 border border-white/8 text-white/85 rounded-tl-sm"
                : "bg-cyan-500/15 border border-cyan-500/25 text-white rounded-tr-sm"
            }`}
          >
            {isAssistant ? (
              <ReactMarkdown
                components={{
                  p({ children }) {
                    return <p className="mb-2 last:mb-0">{children}</p>;
                  },
                  code({ children, ...props }) {
                    const isBlock = (props).node?.position?.start?.line !== (props ).node?.position?.end?.line;
                    return isBlock ? (
                      <code className="block bg-black/30 text-cyan-300 text-xs px-3 py-2 rounded-lg my-2 font-mono overflow-x-auto whitespace-pre">
                        {children}
                      </code>
                    ) : (
                      <code className="bg-black/30 text-cyan-300 text-xs px-1.5 py-0.5 rounded font-mono">
                        {children}
                      </code>
                    );
                  },
                  pre({ children }) {
                    return (
                      <pre className="bg-black/30 rounded-lg p-3 my-2 overflow-x-auto text-xs font-mono">
                        {children}
                      </pre>
                    );
                  },
                  ul({ children }) {
                    return <ul className="list-disc list-inside space-y-1 my-2 text-white/70">{children}</ul>;
                  },
                  ol({ children }) {
                    return <ol className="list-decimal list-inside space-y-1 my-2 text-white/70">{children}</ol>;
                  },
                  li({ children }) {
                    return <li className="text-white/75">{children}</li>;
                  },
                  strong({ children }) {
                    return <strong className="text-white font-semibold">{children}</strong>;
                  },
                  h1({ children }) {
                    return <h1 className="text-base font-semibold text-white mt-3 mb-1">{children}</h1>;
                  },
                  h2({ children }) {
                    return <h2 className="text-sm font-semibold text-white mt-2 mb-1">{children}</h2>;
                  },
                  h3({ children }) {
                    return <h3 className="text-sm font-medium text-white/90 mt-2 mb-0.5">{children}</h3>;
                  },
                  blockquote({ children }) {
                    return (
                      <blockquote className="border-l-2 border-cyan-500/40 pl-3 my-2 text-white/50 italic text-xs">
                        {children}
                      </blockquote>
                    );
                  },
                  hr() {
                    return <hr className="border-white/10 my-3" />;
                  },
                  a({ children, href }) {
                    return (
                      <a href={href} className="text-cyan-400 underline underline-offset-2 hover:text-cyan-300" target="_blank" rel="noopener noreferrer">
                        {children}
                      </a>
                    );
                  },
                }}
              >
                {content}
              </ReactMarkdown>
            ) : (
              <span>{content}</span>
            )}
          </div>
        )}

      
        {isAssistant && !content && (
          <div className="bg-white/5 border border-white/8 rounded-2xl rounded-tl-sm px-4 py-3">
            <div className="flex gap-1 items-center h-4">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-1 h-1 rounded-full bg-cyan-400/50 animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}