const fs = require('fs');
const path = require('path');

const files = [
    'src/pages/Register.jsx',
    'src/pages/Login.jsx',
    'src/pages/FormBuilder.jsx',
    'src/pages/AnalyticsDashboard.jsx',
    'src/pages/AdminDashboard.jsx',
    'src/components/ProtectedRoute.jsx',
    'src/components/Navbar.jsx',
    'src/App.jsx'
];

files.forEach(f => {
    const filePath = path.join(__dirname, f);
    let content = fs.readFileSync(filePath, 'utf8');
    content = content.replace(/\/admin\//g, '/');
    fs.writeFileSync(filePath, content);
    console.log(`Updated ${f}`);
});
