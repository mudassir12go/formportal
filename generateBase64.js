const fs = require('fs');
const a1 = fs.readFileSync('assets/images/a1.png', 'base64');
const stemp = fs.readFileSync('assets/images/stemp.png', 'base64');
const content = `const logoBase64 = "data:image/png;base64,${a1}";\nconst stampBase64 = "data:image/png;base64,${stemp}";\n`;
fs.writeFileSync('assets/images/base64.js', content);
console.log('Done!');
