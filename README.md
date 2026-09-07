# Uncle N Mdulu Restaurant — ordering website

**Live site:** https://unclenmdulu.co.za/
**Order line / WhatsApp:** +27 63 213 9447

*Good food, great memories.*

A single-page ordering site for the restaurant. Customers browse the menu,
build a cart, and send their order straight to the restaurant's WhatsApp —
no server, database, or payment gateway needed.

---

## What's inside

- Sticky header with a live cart (count + running total)
- Animated hero, scroll-in menu cards, and a fly-to-cart effect
  (all disabled automatically for anyone who prefers reduced motion)
- Menu with four categories: **Burgers, Kotas, Wings, Combos**
- Cart drawer with Collection / Delivery, customer details, and notes
- Checkout that opens WhatsApp with the full order pre-filled
- Delivery shows a "fee may apply" note (confirmed on WhatsApp)

## Project structure

    html/index.html     the page (loads ../css, ../js, ../images)
    css/style.css       all styling
    js/app.js           menu data, cart, WhatsApp checkout, animations
    images/             logo + food photos
    README.md           this file

## Run it locally

Open `html/index.html` in any browser. Everything loads via relative paths —
no build step or server required.

## Host / update it

The site is hosted at **https://unclenmdulu.co.za/**. To update it, upload the
whole project folder to your static host (Netlify, GitHub Pages, Cloudflare
Pages), keeping `css`, `js` and `images` next to `html/` so they're served
together.

## Making changes

Everything you'll usually touch:

| Change | Where |
|---|---|
| Prices, menu items, descriptions | `MENU` array near the top of `js/app.js` |
| WhatsApp number | `PHONE_WA` in `js/app.js` |
| Delivery note wording | search "delivery fee may apply" in `js/app.js` |
| Address & opening hours | footer in `html/index.html` |
| Swap a food photo | replace the file in `images/` (keep the same name) |

To **add a menu item**, copy an entry in the `MENU` array and give it a unique
`id`, a `cat` (Burgers / Kotas / Wings / Combos), `name`, `price`, `desc`, and
an `img` path pointing to a file in `images/`.

## QR codes

Print-ready "Scan to order" posters (and a plain QR) that open the site are
generated separately — regenerate any time with `qr-poster.html` by pasting
the URL and downloading.

## Still to do

- [ ] Fill in the real **street address** (footer placeholder)
- [ ] Set the real **trading hours** (footer placeholder)

