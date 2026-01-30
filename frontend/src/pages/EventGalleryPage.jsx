import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function EventGalleryPage() {
    const { id } = useParams();
    const [images, setImages] = useState([]);
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(null);

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            const [imgRes, eventRes] = await Promise.all([
                api.get(`/gallery/?event=${id}`),
                api.get(`/events/${id}/`)
            ]);
            setImages(imgRes.data);
            setEvent(eventRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="min-h-screen bg-black text-cyan-500 font-bold flex items-center justify-center">Loading Gallery...</div>;

    return (
        <>
            <Navbar />
            <div className="pt-32 pb-20 px-6 min-h-screen bg-[#0B0C10]">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-12">
                        <Link to="/events" className="text-gray-500 hover:text-cyan-400 text-sm font-bold uppercase tracking-widest mb-4 inline-block">← Back to Events</Link>
                        <h1 className="text-4xl md:text-5xl font-black text-white font-[Orbitron] uppercase">{event?.title} Gallery</h1>
                        <p className="text-gray-400 mt-2 max-w-2xl">{images.length} moments captured from this event.</p>
                    </div>

                    <div className="columns-1 md:columns-3 gap-6 space-y-6">
                        {images.map((img) => (
                            <div
                                key={img.id}
                                className="break-inside-avoid relative group cursor-pointer overflow-hidden rounded-xl border border-white/10"
                                onClick={() => setSelectedImage(img.image)}
                            >
                                <img
                                    src={img.image}
                                    alt={img.title || "Event Highlight"}
                                    className="w-full h-auto transform group-hover:scale-110 transition duration-700"
                                    loading="lazy"
                                />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center font-bold text-white uppercase tracking-widest text-xs">
                                    View
                                </div>
                            </div>
                        ))}
                    </div>

                    {!images.length && (
                        <div className="p-20 text-center border-2 border-dashed border-white/10 rounded-3xl text-gray-500 font-bold uppercase tracking-widest">
                            No visual data uploaded for this event.
                        </div>
                    )}
                </div>
            </div>

            {/* Lightbox */}
            {selectedImage && (
                <div
                    className="fixed inset-0 bg-black/95 z-[1000] flex items-center justify-center p-4"
                    onClick={() => setSelectedImage(null)}
                >
                    <button className="absolute top-8 right-8 text-white hover:text-cyan-400 text-4xl">✕</button>
                    <img src={selectedImage} alt="Full view" className="max-w-full max-h-[90vh] rounded-xl shadow-[0_0_50px_rgba(6,182,212,0.2)]" />
                </div>
            )}

            <Footer />
        </>
    );
}
