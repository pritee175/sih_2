import React from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { Button } from '../ui/Button';
import { Train, LogOut, User, Bell, Settings, Search, Menu } from 'lucide-react';
import { useUIStore } from '../../store/useUIStore';

export const Header: React.FC = () => {
  const { user, logout } = useAuthStore();
  const { toggleSidebar } = useUIStore();

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-16 z-50 bg-white/95 backdrop-blur border-b border-gray-200 px-6">
      <div className="h-full flex items-center justify-between">
        {/* Branding */}
        <div className="flex items-center gap-3">
          {/* Hamburger for mobile and desktop collapse */}
          <button
            type="button"
            onClick={toggleSidebar}
            className="inline-flex items-center justify-center h-9 w-9 rounded-md border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 md:mr-1"
            aria-label="Toggle sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="bg-primary-600 p-2 rounded-lg shadow">
            <Train className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Kochi Metro</h1>
            <p className="text-xs text-gray-500">Rail Operations & Induction</p>
          </div>
        </div>

        {/* Search */}
        <div className="hidden md:flex items-center gap-2 w-[40%]">
          <div className="relative flex-1">
            <Search className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              className="w-full bg-white border border-gray-300 rounded-md pl-9 pr-3 py-2 text-sm placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
              placeholder="Search trains, jobs, alerts, reports..."
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" className="relative text-gray-700 hover:text-gray-900">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-4 w-4 bg-danger-500 text-white text-[10px] rounded-full flex items-center justify-center">
              3
            </span>
          </Button>

          <Button variant="ghost" size="sm" className="text-gray-700 hover:text-gray-900">
            <Settings className="h-5 w-5" />
          </Button>

          <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
            <User className="h-4 w-4 text-gray-600" />
            <div className="text-sm leading-tight">
              <p className="font-medium text-gray-900">{user?.name}</p>
              <p className="text-gray-600">{user?.role}</p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
};


