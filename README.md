# Uncle N Mdulu Restaurant — ordering website

Static site. No build step, no server.

## Structure
    html/index.html     the page (loads ../css, ../js, ../images)
    css/style.css       all styling
    js/app.js           menu data, cart, WhatsApp checkout, animations
    images/             logo + food photos

## Run locally
Open html/index.html in a browser.

## Host it
Upload the WHOLE project folder and serve from the PROJECT ROOT.
The page is then at:  your-site/html/index.html
(The css, js and images folders sit next to html/, so they must all be
served together — don't publish only the html/ folder, or the assets
above it won't load.)

Want the bare domain (your-site/) to open the page directly? Add a small
redirect index.html at the root — ask and it's a one-liner.

## Common edits
- Prices / menu items ....... MENU array in js/app.js
- WhatsApp number ........... PHONE_WA in js/app.js
- Address / hours ........... footer in html/index.html
- Swap a food photo ......... replace the file in images/ (keep its name)
