# CampusCart

A student-to-student marketplace built exclusively for Raghu Engineering College.
Frontend-only (HTML, CSS, vanilla JavaScript) — no backend yet, all data is
stored in the browser's localStorage so the app works fully offline for demo
and evaluation purposes. A real backend can be plugged in later without
changing the page structure.

## How to run
Just open `index.html` in any browser (double-click it, or use a simple
live-server extension). No build step, no npm install, nothing to configure.

## Demo login
- Roll No: `20951A0501`
- Email: `20951a0501@raghuenggcollege.in`
- Password: `demo123`

Or sign up with any roll number — the email must match the pattern
`rollno@raghuenggcollege.in` (checked on both signup and login) to keep
CampusCart limited to REC students.

## Pages
- `index.html` — Login
- `signup.html` — Create account
- `home.html` — Marketplace: search, filter by category, sort, add to cart/wishlist
- `sell.html` — List an item, with the option to list it up to 10 days
  before it's actually available (a "heads-up" note is shown to buyers)
- `product.html?id=...` — Item details, Buy/Reserve Now with a confirmation
  step that generates a shared Order/Product ID for both the buyer and seller
- `cart.html` / `wishlist.html` — Saved items
- `account.html` — "My Listings" (as seller) and "My Purchases" (as buyer),
  both showing the Order ID once an item is booked

## Key behaviours
- Once a purchase is confirmed, the item is marked `sold`, a translucent
  "Booked" stamp appears over its photo everywhere it's shown, and the Order
  ID appears on both the seller's and the buyer's Account page.
- Items listed with a heads-up window show a "📦 Available in X days" badge
  and the seller's note until that date passes, after which they switch to
  "Available now" automatically.

## Data model (localStorage keys)
- `cc_users` — registered students
- `cc_currentUser` — logged-in roll number
- `cc_products` — all listings
- `cc_cart_<rollNo>` / `cc_wishlist_<rollNo>` — per-user cart & wishlist
- `cc_counter` — running counter used to generate Order IDs (e.g. REC1050)
