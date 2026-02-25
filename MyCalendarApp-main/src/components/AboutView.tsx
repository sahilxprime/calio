import { memo } from 'react';
import { motion } from 'framer-motion';
import { Github, Heart, Code, MapPin, Instagram, Mail } from 'lucide-react';

export const AboutView = memo(function AboutView() {
    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="pt-4 pb-24 px-4 space-y-6"
        >
            {/* App Branding */}
            <div className="text-center space-y-2 py-8">
                <div className="w-20 h-20 bg-gradient-to-tr from-ios-blue to-ios-green rounded-[22px] mx-auto shadow-xl flex items-center justify-center mb-4">
                    <span className="text-white text-4xl font-bold">C</span>
                </div>
                <h1 className="text-3xl font-bold tracking-tight">Calendar 2026</h1>
                <p className="text-ios-gray font-medium text-sm uppercase tracking-widest">Version 1.0.0</p>
            </div>

            {/* Developer Card */}
            <div className="bg-ios-card rounded-[32px] p-6 shadow-sm border border-ios-gray-light space-y-4">
                <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-ios-gray-light rounded-full flex items-center justify-center">
                        <Code className="text-ios-blue" size={24} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold">Sahil</h3>
                        <p className="text-ios-gray text-sm">Lead Developer</p>
                    </div>
                </div>
                
                <div className="space-y-3 pt-2">
                    {/* Instagram Clickable Link */}
                    <a 
                        href="https://instagram.com/primexsahil" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center text-ios-gray text-sm active:opacity-60 transition-opacity"
                    >
                        <Instagram size={18} className="mr-3 text-ios-pink" />
                        <span className="font-medium">@primexsahil</span>
                    </a>

                    {/* Gmail Clickable Link */}
                    <a 
                        href="mailto:primexsahil45@gmail.com" 
                        className="flex items-center text-ios-gray text-sm active:opacity-60 transition-opacity"
                    >
                        <Mail size={18} className="mr-3 text-ios-blue" />
                        <span className="font-medium">primexsahil45@gmail.com</span>
                    </a>

                    <div className="flex items-center text-ios-gray text-sm">
                        <MapPin size={18} className="mr-3 text-ios-red" />
                        <span>Shimla, HP</span>
                    </div>
                </div>
            </div>

            {/* Links */}
            <div className="grid grid-cols-1 gap-4">
                <a href="https://github.com/sahilxprime" target="_blank" rel="noopener noreferrer" className="bg-ios-card rounded-2xl p-4 border border-ios-gray-light flex items-center justify-center space-x-3 active:scale-95 transition-transform">
                    <Github size={20} />
                    <span className="text-sm font-bold">Visit GitHub Profile</span>
                </a>
            </div>

            {/* Footer */}
            <div className="text-center pt-8">
                <div className="flex items-center justify-center text-ios-gray text-xs font-medium space-x-1">
                    <span>Made with</span>
                    <Heart size={12} className="text-ios-red fill-ios-red" />
                    <span>in India</span>
                </div>
            </div>
        </motion.div>
    );
});
