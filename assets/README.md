# Photos

The storefront loads every photo from this folder by file name. Until a file exists, its slot shows a tonal placeholder in the garment's colour, so the site never looks broken.

Use JPGs in 3:4 portrait (about 1200 × 1600 px) for products, compressed to under 400 KB each. Wide banners should be about 2400 × 1100 px.

## products/

| File | Piece |
|---|---|
| lime.jpg | Lime green pin-tuck anarkali set (front) |
| lime-yoke.jpg | Lime anarkali — yoke embroidery close-up |
| lime-flare.jpg | Lime anarkali — pin-tuck flare |
| blush.jpg | Blush pink silk kurta set |
| sage.jpg | Sage silk kurta set, pearl dupatta |
| indigo.jpg | Indigo ajrakh-print kurta set |
| magenta.jpg | Magenta anarkali, vine & bird embroidery |
| navy.jpg | Navy stripe pin-tuck kurta set |
| rose.jpg | Rose pin-tuck anarkali set |
| mint.jpg | Mint embroidered kurta set |
| lavender.jpg | Lavender smocked-yoke set |
| coral.jpg | Coral floral-print kurta |
| kutch.jpg | Black kurta set, Kutch embroidery |
| kaftan.jpg | Grey kaftan, white embroidery |
| peach.jpg | Peach crinkle kurta set |
| orange.jpg | Orange palm-tree embroidery set |
| tealleaf.jpg | Teal leaf-print kurta set |
| skyblue.jpg | Sky-blue embroidered anarkali set |
| redikat.jpg | Red ikat-print kurta |
| blackajrakh.jpg | Black kurta set, ajrakh dupatta |
| bluewine.jpg | Blue & wine ajrakh set |
| redblock.jpg | Red block-print kurta set |
| blackolive.jpg | Black & olive block-print set |
| limeshirt.jpg | Lime shirt-kurta |
| saree-purple.jpg | Purple checked silk saree (model) |
| saree-blue.jpg | Blue checked silk saree (model) |
| saree-bandhani.jpg | Royal blue bandhani saree (model) |
| lehenga.jpg | Kids yellow floral lehenga-choli |
| nehru.jpg | Kids white quilted Nehru jacket |
| tiedye.jpg | Kids tie-dye bubble dress |
| rust.jpg | Kids rust peplum top |

## home/

| File | Where it shows |
|---|---|
| hero-anniversary.jpg | Hero slide 1 — four sets side by side (text sits on the right) |
| hero-diwali.jpg | Hero slide 2 and the Bestsellers banner |
| hero-sarees.jpg | Hero slide 3 — saree model |
| occasion-everyday.jpg | Shop by occasion — Everyday & office |
| occasion-festive.jpg | Shop by occasion — Festive |
| occasion-wedding.jpg | Shop by occasion — Wedding guest |
| occasion-kids.jpg | Shop by occasion — Kids’ celebrations |
| studio-front.jpg, studio-inside.jpg, studio-racks.jpg | Where to find us (Google Business photos) |

To add a new product photo, put the file in `products/` and set `imageUrls` on the product in `src/demo-data.js` (or return it from the API).
