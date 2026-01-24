import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function QuizPortal() {
    const [code, setCode] = useState("");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const [isCodeValid, setIsCodeValid] = useState(false);

    const handleCheckCode = async (e) => {
        e.preventDefault();
        if (!code) return;
        setLoading(true);
        setError("");

        try {
            // Check if code exists and quiz is active
            const res = await api.post("/quizzes/join_by_code/", { code });
            setIsCodeValid(true);
        } catch (err) {
            setError(err.response?.data?.error || "Invalid Node Code");
        } finally {
            setLoading(false);
        }
    };

    const handleJoin = async (e) => {
        e.preventDefault();
        if (!name || !email) {
            setError("Identification Packet Incomplete");
            return;
        }
        setLoading(true);
        setError("");

        try {
            const res = await api.post("/quizzes/join_by_code/", { code, name, email });
            const { quiz, attempt } = res.data;

            // Store identity and code in sessionStorage to persist guest session
            sessionStorage.setItem(`quiz_email_${quiz.id}`, email);
            sessionStorage.setItem(`quiz_name_${quiz.id}`, name);
            sessionStorage.setItem(`quiz_code_${quiz.id}`, code);

            if (attempt.status === 'STARTING') {
                navigate(`/quizzes/${quiz.id}/onboarding`);
            } else if (attempt.status === 'ONGOING') {
                navigate(`/quizzes/${quiz.id}/session`);
            } else {
                setError("Deployment already finalized for this identity.");
            }
        } catch (err) {
            setError(err.response?.data?.error || "Sequence Rejected");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-6 text-white overflow-hidden relative">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[20%] left-[10%] w-[500px] h-[500px] bg-cyan-900/10 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[20%] right-[10%] w-[400px] h-[400px] bg-indigo-900/10 rounded-full blur-[100px] animate-pulse delay-1000" />
            </div>

            <div className="w-full max-w-md bg-[#0a0a0f] border border-white/5 rounded-[40px] p-12 relative z-10 shadow-[0_0_100px_rgba(0,0,0,0.8)]">
                <div className="text-center mb-12">
                    <div className="w-20 h-20 bg-gradient-to-tr from-cyan-600 to-blue-600 rounded-3xl mx-auto flex items-center justify-center font-black text-3xl shadow-lg shadow-cyan-500/20 mb-8 transform rotate-12">
                        R
                    </div>
                    <h1 className="text-3xl font-black font-[Orbitron] uppercase tracking-tighter mb-4">Neural Evaluation</h1>
                    <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.4em]">Integrated Skill Verification System</p>
                </div>

                {!isCodeValid ? (
                    <form onSubmit={handleCheckCode} className="space-y-8">
                        <div className="relative group">
                            <label className="absolute -top-3 left-6 bg-[#0a0a0f] px-2 text-[10px] font-black text-gray-500 group-focus-within:text-cyan-400 transition-colors uppercase tracking-widest">Access Protocol Code</label>
                            <input
                                type="text"
                                value={code}
                                onChange={e => setCode(e.target.value.toUpperCase())}
                                placeholder="NODE_6X7Y"
                                className="w-full bg-transparent border-2 border-white/5 group-focus-within:border-cyan-500/50 rounded-2xl px-8 py-6 text-center text-2xl font-mono font-black tracking-widest outline-none transition-all placeholder:opacity-10"
                            />
                        </div>
                        {error && <div className="text-red-500 text-center text-[10px] font-black uppercase tracking-widest animate-shake">⚠️ {error}</div>}
                        <button type="submit" disabled={loading} className="w-full py-6 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-cyan-500/20 hover:scale-[1.02] transition-all disabled:opacity-50">
                            {loading ? "Decrypting..." : "Initiate Connection"}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleJoin} className="space-y-6">
                        <p className="text-center text-[10px] font-black text-cyan-500 uppercase tracking-widest mb-6 border-b border-cyan-500/20 pb-4">Protocol Validated. Identify Yourself.</p>

                        <div className="space-y-4">
                            <div className="relative group">
                                <label className="block text-[8px] font-black text-gray-600 uppercase tracking-widest mb-2 px-2">Personnel Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    placeholder="Full Name"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-6 py-4 text-sm outline-none focus:border-cyan-500 transition-all font-bold"
                                />
                            </div>
                            <div className="relative group">
                                <label className="block text-[8px] font-black text-gray-600 uppercase tracking-widest mb-2 px-2">Communication Channel (Email)</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder="candidate@nitk.ac.in"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-6 py-4 text-sm outline-none focus:border-cyan-500 transition-all font-bold"
                                />
                            </div>
                        </div>

                        {error && <div className="text-red-500 text-center text-[10px] font-black uppercase tracking-widest">⚠️ {error}</div>}

                        <div className="pt-4 flex flex-col gap-4">
                            <button type="submit" disabled={loading} className="w-full py-6 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:bg-cyan-400 transition-all">
                                {loading ? "Syncing..." : "Proceed to Terms"}
                            </button>
                            <button type="button" onClick={() => setIsCodeValid(false)} className="text-[8px] text-gray-700 font-black uppercase tracking-widest hover:text-red-500 transition-colors">Re-enter Code</button>
                        </div>
                    </form>
                )}

                <p className="mt-12 text-center text-[10px] font-black text-gray-700 uppercase tracking-widest">
                    Authorized Personnel Only ● RoboTech NITK
                </p>
            </div>
        </div>
    );
}
