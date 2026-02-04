import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";

const THEME_STYLES = {
    cyberpunk: {
        bg: "bg-[#050505] text-cyan-400 font-mono",
        card: "bg-black/80 border-2 border-cyan-500/50 shadow-[0_0_30px_rgba(6,255,242,0.1)]",
        input: "bg-black border border-cyan-400/30 focus:border-cyan-400 text-cyan-300 placeholder-cyan-900",
        btn: "bg-cyan-500 text-black hover:bg-magenta-500 hover:text-white uppercase font-black tracking-widest",
        accent: "text-magenta-400",
        progress: "bg-magenta-500",
        font: "font-mono"
    },
    minimal: {
        bg: "bg-white text-gray-900 font-sans",
        card: "bg-white border border-gray-100 shadow-sm",
        input: "bg-gray-50 border border-gray-200 focus:border-gray-900 text-gray-900",
        btn: "bg-gray-900 text-white hover:bg-gray-800",
        accent: "text-gray-400",
        progress: "bg-gray-900",
        font: "font-sans"
    },
    industrial: {
        bg: "bg-[#1a1a1a] text-yellow-500",
        card: "bg-[#222] border-4 border-yellow-500 shadow-[8px_8px_0px_#854d0e]",
        input: "bg-[#111] border-2 border-yellow-800 focus:border-yellow-500 text-yellow-400 font-bold",
        btn: "bg-yellow-500 text-black hover:bg-black hover:text-yellow-500 border-2 border-black font-black",
        accent: "text-yellow-800",
        progress: "bg-yellow-600",
        font: "font-bold"
    },
    academic: {
        bg: "bg-[#f4f1ea] text-[#2c3e50]",
        card: "bg-white border border-[#d3d3d3] shadow-lg rounded-none",
        input: "bg-transparent border-b-2 border-[#d3d3d3] focus:border-[#2c3e50] rounded-none px-0",
        btn: "bg-[#2c3e50] text-[#f4f1ea] hover:bg-[#34495e] rounded-none font-serif italic",
        accent: "text-[#7f8c8d]",
        progress: "bg-[#2c3e50]",
        font: "font-serif"
    },
    solaris: {
        bg: "bg-gradient-to-br from-orange-50 to-white text-orange-950",
        card: "bg-white/80 backdrop-blur-md border border-orange-200 shadow-xl rounded-3xl",
        input: "bg-orange-50/50 border border-orange-200 focus:border-orange-500 text-orange-900 placeholder-orange-300",
        btn: "bg-orange-600 text-white hover:bg-orange-700 shadow-lg shadow-orange-600/20",
        accent: "text-orange-500",
        progress: "bg-orange-500",
        font: "font-sans font-black"
    },
    midnight: {
        bg: "bg-[#020205] text-indigo-100",
        card: "bg-[#0a0a15] border border-indigo-500/20 shadow-[0_0_50px_rgba(79,70,229,0.1)] rounded-[2rem]",
        input: "bg-black/50 border border-indigo-500/30 focus:border-indigo-400 text-indigo-200 placeholder-indigo-900",
        btn: "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:scale-105 transition-transform",
        accent: "text-indigo-400",
        progress: "bg-indigo-600",
        font: "font-sans font-medium"
    }
};

export default function PublicFormView() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [form, setForm] = useState(null);
    const [loading, setLoading] = useState(true);
    const [responses, setResponses] = useState({});
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState("");

    // Pagination State
    const [currentPage, setCurrentPage] = useState(0);

    useEffect(() => {
        fetchForm();
    }, [id]);

    const fetchForm = async () => {
        try {
            const res = await api.get(`/forms/${id}/`);
            setForm(res.data);
            const initial = {};
            res.data.fields.forEach(f => {
                if (f.field_type === 'checkbox') {
                    if (f.options?.length > 0) initial[f.label] = [];
                    else initial[f.label] = false;
                }
                else initial[f.label] = "";
            });
            setResponses(initial);
        } catch (_) {
            navigate("/404");
        } finally {
            setLoading(false);
        }
    };

    const handleNext = (e) => {
        if (e) e.preventDefault();

        const activeSections = form.sections && form.sections.length > 0 ? form.sections : [{ id: null }];
        const currentSection = activeSections[currentPage];
        const sectionFields = form.fields.filter(f => f.section === currentSection.id);

        for (const field of sectionFields) {
            if (field.required && !responses[field.label] && responses[field.label] !== false) {
                setError(`Requirement Not Met: ${field.label}`);
                return;
            }
        }

        setError("");
        setCurrentPage(prev => prev + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleBack = (e) => {
        if (e) e.preventDefault();
        setCurrentPage(prev => prev - 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        // If not on the last page, handleNext (this catches Enter key presses)
        const activeSections = form.sections && form.sections.length > 0 ? form.sections : [{ id: null }];
        if (currentPage < activeSections.length - 1) {
            handleNext();
            return;
        }

        // Final Validation
        for (const field of form.fields) {
            if (field.required && !responses[field.label] && responses[field.label] !== false) {
                setError(`Incomplete Transmission: ${field.label}`);
                return;
            }
        }

        try {
            await api.post("/form-responses/", {
                form: id,
                data: responses
            });
            setSubmitted(true);
        } catch (_) {
            setError("Transmission REJECTED. Security protocol interference.");
        }
    };

    const handleChange = (label, value) => {
        setResponses(prev => ({ ...prev, [label]: value }));
    };

    if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-cyan-500 font-black animate-pulse uppercase tracking-[0.5em] font-[Orbitron]">Decrypting Stream...</div>;

    const theme = THEME_STYLES[form.theme] || THEME_STYLES.cyberpunk;
    const sections = form.sections && form.sections.length > 0 ? form.sections : [{ id: null, title: "Form", description: "" }];
    const currentSection = sections[currentPage];
    const currentFields = form.fields.filter(f => f.section === currentSection.id);
    const progress = ((currentPage + 1) / sections.length) * 100;

    if (submitted) {
        return (
            <div className={`min-h-screen ${theme.bg} flex items-center justify-center p-6 transition-all duration-1000`}>
                <div className={`max-w-md w-full text-center p-12 rounded-[40px] ${theme.card}`}>
                    <div className={`w-24 h-24 rounded-full flex items-center justify-center text-5xl mx-auto mb-8 border-4 ${theme.accent.replace('text', 'border')}`}>✓</div>
                    <h1 className={`text-4xl font-bold mb-4 uppercase tracking-tighter ${theme.font}`}>Nexus Sync Success</h1>
                    <p className="opacity-70 leading-relaxed text-sm mb-10 text-center max-w-lg">
                        {form.success_message || "Your response has been integrated. Session terminates now."}
                    </p>

                    {form.success_link ? (
                        <a
                            href={form.success_link}
                            target="_blank"
                            rel="noreferrer"
                            className={`px-10 py-4 text-xs font-black rounded-2xl transition-all uppercase tracking-widest ${theme.btn}`}
                        >
                            {form.success_link_label || "Continue"}
                        </a>
                    ) : (
                        <button onClick={() => window.close()} className={`px-10 py-4 text-xs font-black rounded-2xl transition-all ${theme.btn}`}>
                            End Link
                        </button>
                    )}
                    <p className={`mt-8 text-[10px] uppercase font-bold tracking-widest ${theme.accent}`}>RoboTech Intelligence Core</p>
                </div>
            </div>
        );
    }

    if (!form.is_active || (form.closes_at && new Date(form.closes_at) < new Date())) {
        const isDeadline = form.closes_at && new Date(form.closes_at) < new Date();
        return (
            <div className={`min-h-screen ${theme.bg} flex items-center justify-center p-6`}>
                <div className={`max-w-md w-full text-center p-12 rounded-[40px] border-2 border-dashed ${theme.accent.replace('text', 'border')}/30 ${theme.card}`}>
                    <div className="w-20 h-20 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">!</div>
                    <h1 className={`text-4xl font-bold uppercase tracking-tighter ${theme.font}`}>
                        {isDeadline ? 'Deadline Reached' : 'Sector Closed'}
                    </h1>
                    <p className="opacity-60 mt-4 leading-relaxed">
                        {isDeadline
                            ? `This signal acquisition channel automatically deactivated on ${new Date(form.closes_at).toLocaleString()}.`
                            : 'This acquisition portal is currently offline. No further submissions are being accepted.'}
                    </p>
                    <p className={`mt-8 text-[10px] uppercase font-bold tracking-widest ${theme.accent}`}>RoboTech Intelligence Core</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen ${theme.bg} transition-colors duration-700 py-12 px-6`}>
            {/* PROGRESS BAR */}
            <div className="fixed top-0 left-0 w-full h-1 bg-white/5 z-50">
                <div
                    className={`h-full transition-all duration-500 ${theme.progress}`}
                    style={{ width: `${progress}%` }}
                />
            </div>

            <div className="max-w-3xl mx-auto">
                {/* HEADER */}
                <div className="mb-16">
                    <div className="flex justify-between items-end mb-4">
                        <h1 className={`text-6xl font-bold uppercase tracking-tighter ${theme.font}`}>{form.title}</h1>
                        <span className={`text-xs font-black uppercase opacity-60`}>Sect {currentPage + 1}/{sections.length}</span>
                    </div>
                    <p className="text-xl opacity-60 leading-relaxed">{form.description}</p>
                    <div className={`h-1.5 w-32 mt-8 rounded-full ${theme.progress}`} />
                </div>

                {/* SECTION INFO */}
                <div className={`p-8 md:p-12 rounded-[40px] mb-12 border-2 border-dashed ${theme.accent.replace('text', 'border')}/20`}>
                    <h2 className={`text-3xl font-black uppercase mb-4 ${theme.font}`}>{currentSection.title}</h2>
                    <p className="opacity-60 text-lg italic">{currentSection.description || "Synthesizing next data requirements..."}</p>
                </div>

                {/* FORM BODY */}
                <form onSubmit={handleSubmit} className={`p-8 md:p-16 rounded-[40px] flex flex-col gap-10 relative overflow-hidden transition-all duration-500 ${theme.card}`}>
                    {error && (
                        <div className="bg-red-500/10 border-l-4 border-red-500 text-red-500 p-6 rounded-2xl text-sm font-bold uppercase animate-pulse">
                            ⚠️ System Fault: {error}
                        </div>
                    )}

                    {currentFields.map(field => (
                        <div key={field.id} className="space-y-4 group">
                            <label className={`block text-[10px] font-black uppercase tracking-[0.2em] group-hover:opacity-100 transition-opacity ${theme.accent}`}>
                                {field.label} {field.required && <span className="text-red-500 ml-1 font-black">●</span>}
                            </label>

                            {field.field_type === 'text' && (
                                <input
                                    className={`w-full p-5 rounded-2xl outline-none transition-all text-lg ${theme.input}`}
                                    placeholder="Awaiting Input..."
                                    value={responses[field.label]}
                                    onChange={e => handleChange(field.label, e.target.value)}
                                />
                            )}

                            {field.field_type === 'textarea' && (
                                <textarea
                                    className={`w-full p-5 rounded-2xl outline-none transition-all text-lg h-40 ${theme.input} resize-none`}
                                    placeholder="Expansion required..."
                                    value={responses[field.label]}
                                    onChange={e => handleChange(field.label, e.target.value)}
                                />
                            )}

                            {field.field_type === 'number' && (
                                <input
                                    type="number"
                                    className={`w-full p-5 rounded-2xl outline-none transition-all text-lg ${theme.input}`}
                                    value={responses[field.label]}
                                    onChange={e => handleChange(field.label, e.target.value)}
                                />
                            )}

                            {field.field_type === 'date' && (
                                <input
                                    type="date"
                                    className={`w-full p-5 rounded-2xl outline-none transition-all text-lg ${theme.input}`}
                                    value={responses[field.label]}
                                    onChange={e => handleChange(field.label, e.target.value)}
                                />
                            )}

                            {field.field_type === 'select' && (
                                <select
                                    className={`w-full p-5 rounded-2xl outline-none transition-all text-lg ${theme.input} appearance-none cursor-pointer`}
                                    value={responses[field.label]}
                                    onChange={e => handleChange(field.label, e.target.value)}
                                >
                                    <option value="">AWAITING SELECTION</option>
                                    {field.options?.map(opt => <option key={opt} value={opt} className="bg-black text-white">{opt}</option>)}
                                </select>
                            )}

                            {field.field_type === 'radio' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {field.options?.length > 0 ? field.options.map(opt => (
                                        <label key={opt} className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between gap-3 group/opt ${responses[field.label] === opt ? theme.progress + ' text-white' : 'bg-black/20 border-white/5 hover:border-white/20'}`}>
                                            <span className="font-bold text-sm uppercase tracking-tighter">{opt}</span>
                                            <input
                                                type="radio"
                                                className="hidden"
                                                checked={responses[field.label] === opt}
                                                onChange={() => handleChange(field.label, opt)}
                                            />
                                            <div className={`w-4 h-4 rounded-full border-2 transition-all ${responses[field.label] === opt ? 'bg-white border-white' : 'border-white/20 group-hover/opt:border-white/50'}`} />
                                        </label>
                                    )) : (
                                        <p className="text-xs text-gray-500 italic">No options configured for this selector.</p>
                                    )}
                                </div>
                            )}

                            {field.field_type === 'checkbox' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {field.options?.length > 0 ? field.options.map(opt => {
                                        const isChecked = responses[field.label]?.includes(opt);
                                        return (
                                            <label key={opt} className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between gap-3 group/opt ${isChecked ? theme.progress + ' text-white' : 'bg-black/20 border-white/5 hover:border-white/20'}`}>
                                                <span className="font-bold text-sm uppercase tracking-tighter">{opt}</span>
                                                <input
                                                    type="checkbox"
                                                    className="hidden"
                                                    checked={isChecked}
                                                    onChange={e => {
                                                        const current = responses[field.label] || [];
                                                        if (e.target.checked) handleChange(field.label, [...current, opt]);
                                                        else handleChange(field.label, current.filter(i => i !== opt));
                                                    }}
                                                />
                                                <div className={`w-4 h-4 rounded-md border-2 transition-all ${isChecked ? 'bg-white border-white' : 'border-white/20 group-hover/opt:border-white/50'}`} />
                                            </label>
                                        );
                                    }) : (
                                        <label className={`p-6 rounded-3xl border cursor-pointer transition-all flex items-center gap-6 ${responses[field.label] ? theme.progress + ' text-white' : 'bg-black/20 border-white/5 hover:border-white/20'}`}>
                                            <input
                                                type="checkbox"
                                                className="w-6 h-6 rounded-lg accent-white"
                                                checked={responses[field.label]}
                                                onChange={e => handleChange(field.label, e.target.checked)}
                                            />
                                            <span className="font-bold text-sm uppercase tracking-widest">{field.label}</span>
                                        </label>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}

                    {/* NAVIGATION CONTROLS */}
                    <div className="pt-10 flex gap-4">
                        {currentPage > 0 && (
                            <button
                                type="button"
                                onClick={handleBack}
                                className={`flex-1 py-5 rounded-3xl font-black text-xs uppercase tracking-widest border-2 transition-all ${theme.accent.replace('text', 'border')}/30 hover:bg-white/5`}
                            >
                                ← RETREAT
                            </button>
                        )}

                        {currentPage < sections.length - 1 ? (
                            <button
                                type="button"
                                onClick={handleNext}
                                className={`flex-[2] py-5 rounded-3xl font-black text-xs uppercase tracking-widest transition-all shadow-2xl ${theme.btn}`}
                            >
                                ADVANCE PHASE →
                            </button>
                        ) : (
                            <button
                                type="submit"
                                className={`flex-[2] py-5 rounded-3xl font-black text-xs uppercase tracking-widest transition-all shadow-2xl ${theme.btn}`}
                            >
                                FINALIZE UPLINK
                            </button>
                        )}
                    </div>
                </form>

                <p className={`mt-10 text-center text-[10px] font-black uppercase tracking-[0.5em] opacity-30 ${theme.accent.replace('text', 'text')}`}>
                    Automated Data Acquisition Node ● RoboTech NITK
                </p>
            </div>
        </div>
    );
}
