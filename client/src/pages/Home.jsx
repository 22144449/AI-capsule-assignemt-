import React from "react";

export default function Home() {
  return (
    <div className="page">
      <h1>AI Capsule</h1>
      <p>
        AI Capsule is a private prompt library. Save the prompts you use with
        ChatGPT, Copilot, Gemini or Claude &mdash; along with the project they
        were for, how useful they were, and whether you reviewed and improved
        them &mdash; so good prompts don't get lost.
      </p>
      <p>Sign in with GitHub to see and manage your own saved prompts.</p>
      <a className="btn" href="/login">
        Sign in with GitHub
      </a>
    </div>
  );
}
