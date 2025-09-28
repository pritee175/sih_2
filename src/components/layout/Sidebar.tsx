import React from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '../../utils';
import { useUIStore } from '../../store/useUIStore';
import { 
  LayoutDashboard, 
  Train, 
  Wrench, 
  Brain, 
  Bell, 
  Megaphone, 
  History, 
  Settings,
  BarChart3,
  FileUp
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Data Upload', href: '/data-upload', icon: FileUp },
  { name: 'Induction Decisions', href: '/induction', icon: Train },
  { name: 'Maintenance & Depot', href: '/maintenance', icon: Wrench },
  { name: 'What-If Simulator', href: '/simulator', icon: Brain },
  { name: 'IoT Alerts', href: '/alerts', icon: Bell },
  { name: 'Branding Campaigns', href: '/branding', icon: Megaphone },
  { name: 'History & Export', href: '/history', icon: History },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export const Sidebar: React.FC = () => {
  const { isSidebarOpen, closeSidebar, toggleSidebar } = useUIStore();
  return (
    <div
      className={cn(
        'fixed top-16 left-0 bottom-0 w-64 bg-white/90 backdrop-blur border-r border-gray-200 transform transition-transform duration-200 ease-out z-50 md:z-40',
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:-translate-x-64'
      )}
      aria-hidden={!isSidebarOpen}
    >
      <nav className="mt-4 px-3">
        <div className="space-y-1">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                  isActive
                    ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-600'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                )
              }
              onClick={() => { if (window.innerWidth < 768) closeSidebar(); }}
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    className={cn(
                      'mr-3 h-5 w-5 flex-shrink-0',
                      isActive ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-600'
                    )}
                  />
                  {item.name}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
      <div className="absolute bottom-0 w-64 p-4 border-t border-gray-200 bg-white/70">
        <div className="text-xs text-gray-500 text-center">
          <p>Kochi Metro Rail Limited</p>
          <p>v1.0.0 • AI Induction System</p>
        </div>
        <button
          onClick={toggleSidebar}
          className="mt-3 w-full text-xs text-gray-600 hover:text-gray-900 py-2 rounded-md border border-gray-200 hover:bg-gray-50"
        >
          {isSidebarOpen ? 'Collapse Sidebar' : 'Expand Sidebar'}
        </button>
      </div>
    </div>
  );
};


