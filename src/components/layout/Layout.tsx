import React from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { useUIStore } from '../../store/useUIStore';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isSidebarOpen, closeSidebar } = useUIStore();
  return (
    <div className="min-h-screen bg-white">
      {/* Fixed Top Header */}
      <Header />
      <div className="flex">
        {/* Fixed Sidebar under header */}
        <Sidebar />
        {/* Content area with padding to avoid overlapping fixed header */}
        <main className={`flex-1 pt-20 p-6 text-gray-900 transition-[padding] duration-200 ease-out ${isSidebarOpen ? 'md:pl-64' : 'md:pl-0'}`}>
          {children}
        </main>
        {/* Mobile backdrop when sidebar is open */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/30 z-40 md:hidden"
            onClick={closeSidebar}
            aria-hidden="true"
          />
        )}
      </div>
    </div>
  );
};


