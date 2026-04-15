import React, { useState } from 'react';
import { Camera, Calendar, Clock, MapPin, Phone, Mail, CheckCircle, CarFront, Shield, Star, Wrench, Menu, X, ChevronRight, PaintBucket, Sparkles, Droplets } from 'lucide-react';

export default function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    vehicleMake: '',
    vehicleModel: '',
    serviceType: 'panel-beating',
    date: '',
    notes: ''
  });
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitStatus('loading');
    
    try {
      // 🔧 Connecting directly to your live Render Backend!
      const response = await fetch('https://nexus-backend-q1ld.onrender.com/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: formData.name,
          email: formData.email,
          phone: formData.phone,
          vehicle: `${formData.vehicleMake} ${formData.vehicleModel}`,
          service: formData.serviceType,
          date: formData.date,
          notes: formData.notes
        })
      });

      if (response.ok) {
        setSubmitStatus('success');
        setFormData({ name: '', email: '', phone: '', vehicleMake: '', vehicleModel: '', serviceType: 'panel-beating', date: '', notes: '' });
        setTimeout(() => setSubmitStatus('idle'), 5000);
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-blue-200">
      
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                <PaintBucket size={24} />
              </div>
              <span className="text-2xl font-black tracking-tight text-slate-900">Spray<span className="text-blue-600">Bar</span>.</span>
            </div>
            
            <div className="hidden md:flex items-center gap-8 font-medium">
              <a href="#services" className="text-slate-600 hover:text-blue-600 transition-colors">Services</a>
              <a href="#about" className="text-slate-600 hover:text-blue-600 transition-colors">About Us</a>
              <a href="#gallery" className="text-slate-600 hover:text-blue-600 transition-colors">Gallery</a>
              <a href="#book" className="bg-blue-600 text-white px-6 py-2.5 rounded-full hover:bg-blue-700 transition-all shadow-md shadow-blue-200 font-semibold">Book Now</a>
            </div>

            <button className="md:hidden p-2 text-slate-600" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
        
        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-100 absolute w-full shadow-lg">
            <div className="px-4 pt-2 pb-6 space-y-2">
              <a href="#services" className="block px-3 py-3 rounded-md font-medium hover:bg-slate-50" onClick={() => setIsMenuOpen(false)}>Services</a>
              <a href="#about" className="block px-3 py-3 rounded-md font-medium hover:bg-slate-50" onClick={() => setIsMenuOpen(false)}>About Us</a>
              <a href="#book" className="block px-3 py-3 rounded-md font-medium bg-blue-50 text-blue-700" onClick={() => setIsMenuOpen(false)}>Book Now</a>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-slate-50 to-white -z-10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 font-medium text-sm mb-6">
                <Sparkles size={16} /> Premium Auto Body Care
              </div>
              <h1 className="text-5xl md:text-6xl font-black tracking-tight text-slate-900 leading-tight mb-6">
                Flawless Finish, <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Zero Compromise.</span>
              </h1>
              <p className="text-xl text-slate-600 mb-8 leading-relaxed">
                Expert panel beating, precision spray painting, and professional polishing. We restore your vehicle to factory perfection with cutting-edge technology.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a href="#book" className="bg-blue-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-blue-700 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-200">
                  Get a Free Quote <ChevronRight size={20} />
                </a>
                <a href="tel:+27123456789" className="bg-white text-slate-700 border-2 border-slate-200 px-8 py-4 rounded-full font-bold text-lg hover:border-slate-300 hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
                  <Phone size={20} /> Call Us Now
                </a>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-100 to-transparent rounded-3xl transform rotate-3 scale-105 -z-10" />
              <img 
                src="https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&q=80&w=1000" 
                alt="Luxury car in spray booth" 
                className="rounded-3xl shadow-2xl object-cover h-[500px] w-full"
              />
              {/* Floating Badge */}
              <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-2xl shadow-xl flex items-center gap-4">
                <div className="bg-green-100 p-3 rounded-xl text-green-600">
                  <Shield size={24} />
                </div>
                <div>
                  <p className="text-sm text-slate-500 font-medium">Guarantee</p>
                  <p className="font-bold text-slate-900">Lifetime Warranty</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-black text-slate-900 mb-4">Our Premium Services</h2>
            <p className="text-lg text-slate-600">We use industry-leading paints, tools, and techniques to ensure your vehicle leaves looking better than the day you bought it.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 hover:shadow-xl hover:border-blue-100 transition-all group">
              <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <PaintBucket size={28} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">Spray Painting</h3>
              <p className="text-slate-600 mb-6 leading-relaxed">Computerized color matching and premium water-based paints applied in our dust-free baking ovens for a flawless, durable finish.</p>
              <ul className="space-y-2 mb-6 text-sm text-slate-700 font-medium">
                <li className="flex items-center gap-2"><CheckCircle size={16} className="text-blue-500"/> Full Resprays</li>
                <li className="flex items-center gap-2"><CheckCircle size={16} className="text-blue-500"/> Scratch Repair</li>
                <li className="flex items-center gap-2"><CheckCircle size={16} className="text-blue-500"/> Custom Colors</li>
              </ul>
            </div>

            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 hover:shadow-xl hover:border-blue-100 transition-all group">
              <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Wrench size={28} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">Panel Beating</h3>
              <p className="text-slate-600 mb-6 leading-relaxed">Precision chassis straightening and dent removal using advanced pulling systems to restore structural integrity.</p>
              <ul className="space-y-2 mb-6 text-sm text-slate-700 font-medium">
                <li className="flex items-center gap-2"><CheckCircle size={16} className="text-blue-500"/> Collision Repair</li>
                <li className="flex items-center gap-2"><CheckCircle size={16} className="text-blue-500"/> Paintless Dent Removal</li>
                <li className="flex items-center gap-2"><CheckCircle size={16} className="text-blue-500"/> Rust Repair</li>
              </ul>
            </div>

            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 hover:shadow-xl hover:border-blue-100 transition-all group">
              <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Droplets size={28} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">Auto Detailing</h3>
              <p className="text-slate-600 mb-6 leading-relaxed">Multi-stage machine polishing, ceramic coating, and deep interior cleaning to protect your investment.</p>
              <ul className="space-y-2 mb-6 text-sm text-slate-700 font-medium">
                <li className="flex items-center gap-2"><CheckCircle size={16} className="text-blue-500"/> Ceramic Coating</li>
                <li className="flex items-center gap-2"><CheckCircle size={16} className="text-blue-500"/> Paint Correction</li>
                <li className="flex items-center gap-2"><CheckCircle size={16} className="text-blue-500"/> Interior Valet</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Booking Form Section */}
      <section id="book" className="py-24 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-16">
            
            <div>
              <h2 className="text-4xl md:text-5xl font-black mb-6">Ready to restore your ride?</h2>
              <p className="text-xl text-slate-400 mb-10">Fill out the form to request a free, no-obligation quote. Our estimators will get back to you within 2 hours.</p>
              
              <div className="space-y-8">
                <div className="flex items-start gap-4">
                  <div className="bg-blue-600/20 p-3 rounded-xl text-blue-400 mt-1"><Clock size={24} /></div>
                  <div>
                    <h4 className="text-xl font-bold mb-1">Operating Hours</h4>
                    <p className="text-slate-400">Mon-Fri: 7:30 AM - 5:30 PM<br/>Sat: 8:00 AM - 1:00 PM</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-blue-600/20 p-3 rounded-xl text-blue-400 mt-1"><MapPin size={24} /></div>
                  <div>
                    <h4 className="text-xl font-bold mb-1">Our Location</h4>
                    <p className="text-slate-400">123 Auto Avenue<br/>Industrial District, City 0001</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-8 md:p-10 text-slate-900 shadow-2xl relative">
              {submitStatus === 'success' ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-12">
                  <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle size={40} />
                  </div>
                  <h3 className="text-3xl font-bold mb-4">Request Received!</h3>
                  <p className="text-slate-600 mb-8">Thank you, {formData.name}. We have received your booking request and will contact you shortly to confirm.</p>
                  <button 
                    onClick={() => setSubmitStatus('idle')}
                    className="bg-slate-100 text-slate-700 px-6 py-2 rounded-full font-semibold hover:bg-slate-200 transition-colors"
                  >
                    Submit Another Request
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <h3 className="text-2xl font-bold mb-6">Request a Quote</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 sm:col-span-1">
                      <label className="block text-sm font-bold text-slate-700 mb-2">Full Name</label>
                      <input required type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all" placeholder="John Doe" />
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <label className="block text-sm font-bold text-slate-700 mb-2">Phone Number</label>
                      <input required type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all" placeholder="082 123 4567" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
                    <input required type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all" placeholder="john@example.com" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 sm:col-span-1">
                      <label className="block text-sm font-bold text-slate-700 mb-2">Vehicle Make</label>
                      <input required type="text" name="vehicleMake" value={formData.vehicleMake} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all" placeholder="e.g. Toyota" />
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <label className="block text-sm font-bold text-slate-700 mb-2">Vehicle Model</label>
                      <input required type="text" name="vehicleModel" value={formData.vehicleModel} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all" placeholder="e.g. Hilux" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 sm:col-span-1">
                      <label className="block text-sm font-bold text-slate-700 mb-2">Service Required</label>
                      <select name="serviceType" value={formData.serviceType} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all appearance-none font-medium text-slate-700">
                        <option value="panel-beating">Panel Beating</option>
                        <option value="spray-painting">Spray Painting</option>
                        <option value="detailing">Auto Detailing</option>
                        <option value="dent-removal">Paintless Dent Removal</option>
                        <option value="assessment">Quote / Assessment</option>
                      </select>
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <label className="block text-sm font-bold text-slate-700 mb-2">Preferred Date</label>
                      <input type="date" name="date" value={formData.date} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Additional Notes (Optional)</label>
                    <textarea name="notes" value={formData.notes} onChange={handleInputChange} rows={3} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all resize-none" placeholder="Describe the damage..." />
                  </div>

                  {submitStatus === 'error' && (
                    <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm font-medium">
                      There was an error submitting your request. Please try again or call us.
                    </div>
                  )}

                  <button 
                    type="submit" 
                    disabled={submitStatus === 'loading'}
                    className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition-all shadow-md shadow-blue-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {submitStatus === 'loading' ? (
                      <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      'Submit Booking Request'
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 py-12 text-center text-slate-500 text-sm">
        <p>&copy; {new Date().getFullYear()} SprayBar Auto Body. All rights reserved.</p>
      </footer>
    </div>
  );
}