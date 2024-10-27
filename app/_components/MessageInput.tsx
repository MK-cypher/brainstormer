"use client";
import {FormEvent, useEffect, useRef, useState} from "react";
import ReactMarkdown from "react-markdown";
import Arrow from "./Arrow";
import Refresh from "./Refresh";

export default function MessageInput() {
  const [step, setStep] = useState(0);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const textAreaRef = useRef<any>(null);

  const submit = async () => {
    setLoading(true);
    setError("");
    setResult("");

    const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/request`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({subject, message}),
    });

    const result = await res.json();
    if (res.ok) {
      setResult(result.response);
    } else {
      setError(result.response);
    }

    setLoading(false);
  };

  useEffect(() => {
    if (textAreaRef && textAreaRef.current) {
      textAreaRef.current.style.height = "auto";
      textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`;
    }
  }, [message]);

  return (
    <div className="container pb-20">
      <div className="space-y-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
          }}
          className="flex items-center gap-2"
        >
          <input
            className="w-full rounded-xl py-2 px-2 bg-slate-500 resize-none min-h-5 max-h-32"
            placeholder="What would you like the Ideas to be about? (Eg.: Software Project with AI features)"
            onChange={(e) => {
              e.target.value.length == 0 && setStep(0);
              setSubject(e.target.value);
            }}
          />
          {step == 0 && (
            <button
              className="rounded-full p-2 bg-blue-400"
              onClick={() => {
                subject.length > 0 && setStep(1);
              }}
            >
              <Arrow height={24} width={24} />
            </button>
          )}
        </form>
        {step > 0 && (
          <div className="">
            <textarea
              ref={textAreaRef}
              autoFocus
              className="w-full rounded-xl py-1 px-2 bg-slate-500 resize-none min-h-5 max-h-32"
              placeholder="Do you have any extra information or details to add? if not just Leave it empty"
              onChange={(e) => {
                setMessage(e.target.value);
              }}
            />
            <div className="flex items-center justify-center">
              <button
                className={`rounded-full p-2 bg-blue-400 ${loading && "loading"}`}
                onClick={() => {
                  result.length ? setResult("") : submit();
                }}
              >
                <span></span>
                {result.length ? (
                  <div className="flex items-center gap-2">
                    <div>Reset</div>
                    <Refresh width={24} height={24} />{" "}
                  </div>
                ) : (
                  "Generate"
                )}
              </button>
            </div>
          </div>
        )}
      </div>
      <div className="mt-10">
        {error && <div className="text-red-500">{error}</div>}
        {result && (
          <div className="markdown-content">
            <ReactMarkdown>{result}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}
