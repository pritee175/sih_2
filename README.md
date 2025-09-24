# Kochi Metro - AI-Driven Train Induction Planning & Scheduling

A production-ready React + TypeScript + Tailwind frontend for the Smart India Hackathon (SIH) problem statement: "AI-Driven Train Induction Planning & Scheduling" for Kochi Metro.

## 🚀 Features

### Core Functionality
- **AI-Driven Optimization**: Automated train induction planning with explainable AI recommendations
- **Decision Support**: Interactive decision-making interface with mandatory justification for overrides
- **Real-time Monitoring**: IoT alerts feed with live fitness certificate updates
- **What-If Simulation**: Test different scenarios and analyze their impact
- **Comprehensive Analytics**: KPI dashboards with performance insights
- **Audit Trail**: Complete history of decisions with reasoning logs

### Key Pages
1. **Dashboard**: Fleet overview, KPIs, and quick actions
2. **Induction Decisions**: Main operator interface with AI recommendations
3. **Maintenance & Depot**: Maintenance queue management and depot operations
4. **What-If Simulator**: Scenario testing and impact analysis
5. **IoT Alerts**: Real-time monitoring and alert management
6. **Branding Campaigns**: Campaign management and train assignments
7. **History & Export**: Decision history with export capabilities
8. **Analytics**: Performance insights and trend analysis

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS with custom design system
- **Routing**: React Router v6
- **State Management**: Zustand + React Query
- **Charts**: Recharts for data visualization
- **Icons**: Lucide React
- **Mocking**: MSW (Mock Service Worker)
- **Testing**: Jest + React Testing Library
- **Build Tool**: Vite
- **Linting**: ESLint + Prettier

## 📦 Installation

```bash
# Clone the repository
git clone <repository-url>
cd kochi-metro-induction

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Lint code
npm run lint

# Format code
npm run format
```

## 🎯 Demo Script

1. **Login**: Use credentials `supervisor1` / `password`
2. **Dashboard**: View fleet KPIs and depot summaries
3. **Run Optimizer**: Generate AI-ranked induction recommendations
4. **Review Decisions**: Drill into train details and AI reasoning
5. **Override Decision**: Send train to maintenance with justification
6. **IoT Alert**: See real-time fitness failure alert
7. **What-If**: Simulate depot closure scenario
8. **Export**: Download CSV/PDF reports
9. **History**: Review decision audit trail

## 🏗️ Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── ui/              # Base UI components (Button, Card, Input)
│   ├── auth/            # Authentication components
│   ├── layout/          # Layout components (Header, Sidebar)
│   ├── dashboard/       # Dashboard-specific components
│   └── induction/       # Induction decision components
├── pages/               # Page components
├── hooks/               # Custom React hooks
├── services/            # API service layer
├── store/               # Zustand state stores
├── types/               # TypeScript type definitions
├── utils/               # Utility functions
├── data/                # Mock data
├── mocks/               # MSW mock handlers
└── test/                # Test setup and utilities
```

## 🔧 Configuration

### Environment Variables
Create a `.env.local` file:
```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_APP_TITLE=Kochi Metro Induction Planning
```

### Mock Data
The application uses MSW for API mocking. Mock data includes:
- 25 trainsets across 3 depots
- Maintenance jobs and schedules
- IoT alerts and notifications
- Branding campaigns
- Historical decision data

## 🎨 Design System

### Colors
- **Primary**: Blue (#3b82f6) - Main actions and navigation
- **Success**: Green (#10b981) - Positive states and success
- **Warning**: Amber (#f59e0b) - Caution and pending states
- **Danger**: Red (#ef4444) - Errors and critical states
- **Metro**: Custom metro-themed colors

### Components
- **Cards**: Consistent card layouts with shadows and borders
- **Buttons**: Multiple variants (primary, secondary, danger, success)
- **Forms**: Accessible form components with validation
- **Tables**: Sortable and filterable data tables
- **Charts**: Responsive charts using Recharts

## 📱 Responsive Design

The application is fully responsive and works on:
- Desktop (1024px+)
- Tablet (768px - 1023px)
- Mobile (320px - 767px)

## ♿ Accessibility

- Semantic HTML structure
- ARIA labels and roles
- Keyboard navigation support
- Screen reader compatibility
- Color contrast compliance
- Focus management

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm test -- --coverage
```

### Test Coverage
- Component rendering tests
- User interaction tests
- API integration tests
- Accessibility tests

## 📊 Performance

- **Lazy Loading**: Components and routes are lazy-loaded
- **Code Splitting**: Automatic code splitting with Vite
- **Optimized Images**: Optimized SVG icons and assets
- **Bundle Size**: ~500KB gzipped for production build

## 🔒 Security

- Input validation and sanitization
- XSS protection
- CSRF protection (when integrated with backend)
- Secure authentication flow
- Environment variable protection

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Vercel
```bash
npx vercel --prod
```

### Deploy to Netlify
```bash
npm run build
# Upload dist/ folder to Netlify
```

## 📈 Future Enhancements

- [ ] Real-time WebSocket integration
- [ ] Advanced analytics with ML insights
- [ ] Mobile app with React Native
- [ ] Multi-language support
- [ ] Dark mode theme
- [ ] Advanced reporting features
- [ ] Integration with Maximo CMMS
- [ ] Real IoT device integration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Team

Built for Smart India Hackathon 2025 - Kochi Metro Rail Limited

## 📞 Support

For support and questions, please contact the development team or create an issue in the repository.

---

**Note**: This is a demo application built for SIH 2025. The mock APIs and data are for demonstration purposes only.


