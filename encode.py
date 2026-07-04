import base64

with open('assets/images/a1.png', 'rb') as f:
    a1_b64 = base64.b64encode(f.read()).decode('utf-8')

with open('assets/images/stemp.png', 'rb') as f:
    stemp_b64 = base64.b64encode(f.read()).decode('utf-8')

with open('assets/images/base64.js', 'w') as f:
    f.write('const logoBase64 = "data:image/png;base64,' + a1_b64 + '";\n')
    f.write('const stampBase64 = "data:image/png;base64,' + stemp_b64 + '";\n')
