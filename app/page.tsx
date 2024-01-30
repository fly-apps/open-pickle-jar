'use client'

import { SyntheticEvent, useEffect, useState } from "react";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [pickles, setPickles] = useState<string[]>([]);
  const [w, setW] = useState<number>(150);
  const [h, setH] = useState<number>(150);
  const [time, setTime] = useState<number>(0);

  const handleSubmit = async (event: SyntheticEvent) => {
    event.preventDefault();
    setLoading(true);
    setPickles([]);
    setTime(0);

    const response = await fetch("/open-pickle-jar", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        width: w,
        height: h,
      }),
    });
    const body = await response.json();
    setLoading(false);
    setPickles(body);
  };

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    if (loading) {
      // setting time from 0 to 1 every 10 milisecond using javascript setInterval method
      intervalId = setInterval(() => setTime(time + 1), 10);
    }
    return () => clearInterval(intervalId);
  }, [loading, time]);

  // Minutes calculation
  const minutes = Math.floor((time % 360000) / 6000);

  // Seconds calculation
  const seconds = Math.floor((time % 6000) / 100);

  // Milliseconds calculation
  const milliseconds = time % 100;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <header className="text-center w-[600px] flex flex-col gap-4 mb-8">
        <img src="/pickle-logo.png" alt="pickle" className="w-24 mx-auto mb-4" />
        <h1 className="font-bold text-4xl text-lime-900 mb-8">Open Pickle Jar</h1>
        <p>You&apos;ve got a jar of pickles <span className="text-lime-600 font-bold"> (a <code className="text-sm font-regular text-lime-700 bg-gray-50 p-1 rounded border border-gray-300">.zip</code> file of some high-def pickle photographs)</span><br/> that you would like to open <span className="text-lime-600 font-bold">(resize and display below)</span>.</p>
        <p>Choose what size you&apos;d like to make the images, and then &quot;Open pickle jar&quot;.</p>
      </header>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex gap-4">
          <div>
            <label htmlFor="width" className="text-gray-700">Width (px)</label>
            <input onChange={(e) => setW(parseInt(e.target.value))} type="number" min="1" placeholder="150" name="width" id="width" className="p-4 block rounded-md outline-none border border-transparent ring-2 ring-transparent focus:ring-2 focus:ring-lime-400 focus:border-lime-500 focus:border shadow-sm text-lg mt-2" />
          </div>
          <div>
            <label htmlFor="height" className="text-gray-700">Height (px)</label>
            <input onChange={(e) => setH(parseInt(e.target.value))} type="number" min="1" placeholder="150" name="height" id="height" className="p-4 block rounded-md outline-none border border-transparent ring-2 ring-transparent focus:ring-2 focus:ring-lime-400 focus:border-lime-500 focus:border shadow-sm text-lg mt-2" />
          </div>
        </div>
        <button type="submit" className={`${!loading ? "bg-lime-700" : "bg-gray-400"} text-white py-4 px-5 rounded ${!loading ? "hover:bg-lime-800" : ""}`} disabled={loading}>Open pickle jar</button>
      </form>
      {loading && <p className="mt-4 text-gray-700">Loading pickles...Time elapsed:</p>}
      {time && 
        <p className="mt-4 text-gray-700">{minutes.toString().padStart(2, "0")} : {seconds.toString().padStart(2, "0")} : {milliseconds.toString().padStart(2, "0")}</p>
      }
      {pickles &&
        <div className="grid grid-cols-8 gap-3 mt-12">
          {pickles.map((pickle) => (
          <img
            key={pickle}
            src={pickle}
            alt="pickle"
            className="rounded-md"
          />
        ))}
        </div>
      }
    </main>
  );
}
