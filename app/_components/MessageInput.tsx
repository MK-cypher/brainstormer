"use client";
import React, {FormEvent, useEffect, useRef, useState} from "react";
import Arrow from "./Arrow";
import ReactMarkdown from "react-markdown";

export default function MessageInput() {
  const [step, setStep] = useState(0);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const textAreaRef = useRef<any>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
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
              setSubject(e.target.value);
            }}
          />
          <button
            className="rounded-full p-2 bg-blue-400"
            onClick={() => {
              subject.length > 0 && setStep(1);
            }}
          >
            <Arrow height={24} width={24} />
          </button>
        </form>
        {step > 0 && (
          <form onSubmit={submit} className="">
            <div className="flex items-center gap-2">
              <textarea
                ref={textAreaRef}
                className="w-full rounded-xl py-1 px-2 bg-slate-500 resize-none min-h-5 max-h-32"
                placeholder="Do you have anything to add? if not just Leave it empty"
                onChange={(e) => {
                  setMessage(e.target.value);
                }}
              />
              <button className={`rounded-full p-2 bg-blue-400 ${loading && "loading"}`}>
                <span></span>
                <Arrow height={24} width={24} />
              </button>
            </div>
          </form>
        )}
      </div>
      <div className="mt-10">
        {error && <div className="text-red-500">{error}</div>}
        {result && (
          <div className="markdown-content">
            {" "}
            <ReactMarkdown>{result}</ReactMarkdown>{" "}
          </div>
        )}
      </div>
      {/* <pre className="my-20 max-w-full text-wrap whitespace-pre">{result}</pre> */}
    </div>
  );
}