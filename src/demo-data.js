// Studio pieces named in the Sahasram design boards (stock sheets of 26–27 Sep).
// Names and prices come from the designs. Sizes, fabrics marked "To confirm" and
// saree prices are placeholders until the inventory-sheet import replaces them.
// Photos load from /assets/products/<photo>.jpg — see assets/README.md.
const studio = (id, sku, photo, name, shortDescription, category, subCategory, price, fabric, color, swatch, work, occasion, sizes, labels = [], createdAt = "2026-10-12", extra = {}) => ({
  id, sku, quickRef: id, name, shortDescription, category, subCategory, price, mrp: extra.mrp || price, currency: "INR", taxInclusive: true,
  fabric, color, swatch, work, occasion, sizes: sizes.map(s => typeof s === "string" ? {label: s, available: 1} : s),
  imageUrls: [`assets/products/${photo}.jpg`, ...(extra.gallery || []).map(g => `assets/products/${g}.jpg`)],
  onlineVisible: true, location: "KPHB Studio", stockStatus: "in_stock", labels, createdAt,
  descriptors: [category, subCategory, fabric, color, work, ...occasion, ...(extra.styles || [])], styles: extra.styles || [],
  setPieces: extra.setPieces || (category === "Sarees" ? ["Sari", "Unstitched blouse piece"] : category === "Kids" ? ["Top", "Bottom"] : category === "Kurta Sets" ? ["Kurta", "Pants", "Dupatta"] : ["Kurta"]),
});
const L = (kind, text) => ({kind, text});
const sold = (label) => ({label, available: 0});
const KIDS = "Kids’ celebrations";
const starterProducts = [
  studio("W-001","SM RSS0044","lime","Lime green pin-tuck anarkali set","Pin-tuck anarkali with floral embroidery on the yoke, with pants and dupatta","Kurta Sets","Anarkalis",6500,"To confirm","Lime","#C9C775","Pin-tuck · yoke embroidery",["Festive","Wedding guest"],[sold("S / 36"),sold("M / 38"),"L / 40",sold("XL / 42")],[L("window","In our window this week"),L("last_piece","Last piece")],"2026-10-20",{gallery:["lime-yoke","lime-flare"],styles:["anarkali","pin-tuck"]}),
  studio("W-002","SM RSS0071","blush","Blush pink silk kurta set","A soft silk set with tonal embroidery, made for celebrations","Kurta Sets","Silk sets",10700,"Silk","Blush","#E4B9B4","Embroidery",["Wedding guest","Festive"],["M / 38"],[L("window","In our window this week"),L("last_piece","Last piece")],"2026-10-18",{styles:["silk"]}),
  studio("W-003","SM RSS0072","sage","Sage silk kurta set with pearl-embroidered dupatta","Sage silk with a pearl-embroidered dupatta","Kurta Sets","Silk sets",10700,"Silk","Sage","#A9B59A","Pearl embroidery",["Wedding guest","Festive"],["L / 40"],[L("handpicked","Signature"),L("last_piece","Last piece")],"2026-10-18",{styles:["silk"]}),
  studio("W-004","SJ RSS0031","indigo","Indigo ajrakh-print kurta set","Hand block-printed ajrakh in deep indigo, easy for long days","Kurta Sets","Block print",2950,"Cotton","Indigo","#3E4C72","Ajrakh block print",["Everyday & office"],["S / 36","M / 38","L / 40"],[L("window","In our window this week")],"2026-10-15",{styles:["ajrakh"]}),
  studio("W-005","SM RSS0050","magenta","Magenta anarkali with vine and bird embroidery","A flared magenta anarkali with vine-and-bird embroidery","Kurta Sets","Anarkalis",6500,"To confirm","Magenta","#B0306A","Vine & bird embroidery",["Festive","Wedding guest"],["M / 38"],[L("handpicked","Signature"),L("last_piece","Last piece")],"2026-10-19",{styles:["anarkali","embroidered"]}),
  studio("W-006","SM RSS0058","navy","Navy stripe pin-tuck kurta set","Navy stripes with fine pin-tucks and a clean, tailored fall","Kurta Sets","Pin-tuck sets",9000,"To confirm","Navy","#2C3A5C","Pin-tuck",["Everyday & office","Festive"],["L / 40"],[L("handpicked","Signature"),L("last_piece","Last piece")],"2026-10-17",{styles:["pin-tuck"]}),
  studio("W-007","SM RSS0063","rose","Rose pin-tuck anarkali set, embroidered dupatta","Rose pin-tuck anarkali with an embroidered dupatta","Kurta Sets","Anarkalis",4140,"To confirm","Rose","#D48A97","Pin-tuck · embroidery",["Festive"],["M / 38","L / 40"],[L("handpicked","New"),L("new","New arrival")],"2026-10-23",{styles:["anarkali","pin-tuck","embroidered"]}),
  studio("W-008","SM RSS0066","mint","Mint embroidered kurta set","Fresh mint with tonal embroidery on the yoke","Kurta Sets","Embroidered sets",4250,"To confirm","Mint","#A8D3BE","Embroidery",["Festive","Everyday & office"],["M / 38"],[],"2026-10-14",{styles:["embroidered","pin-tuck"]}),
  studio("W-009","SM RSS0067","lavender","Lavender smocked-yoke embroidered set","Lavender with a smocked yoke and soft embroidery","Kurta Sets","Embroidered sets",4620,"To confirm","Lavender","#B7A6CF","Smocking · embroidery",["Festive"],["S / 36","M / 38"],[],"2026-10-22",{styles:["embroidered","pin-tuck"]}),
  studio("W-010","SJ RSS0012","coral","Coral floral-print kurta","An easy coral kurta in a bright floral print","Kurtas","Straight kurtas",790,"Cotton","Coral","#E58466","Floral print",["Everyday & office"],[sold("S / 36"),"M / 38"],[L("bestseller","Bestseller")],"2026-10-08"),
  studio("W-011","SJ RSS0020","kutch","Black kurta set with Kutch embroidery","Black cotton with bright Kutch mirror embroidery","Kurta Sets","Mirror & Kutch work",1630,"Cotton","Black","#2A2624","Kutch mirror work",["Everyday & office","Festive"],["M / 38","L / 40"],[L("bestseller","Bestseller")],"2026-10-06",{styles:["kutch"]}),
  studio("W-012","SJ RSS0024","kaftan","Grey kaftan with white embroidery","A relaxed grey kaftan with crisp white embroidery","Kurtas","Dresses & kaftans",1250,"To confirm","Grey","#9C9893","Embroidery",["Everyday & office"],["Free size"],[L("bestseller","Trending")],"2026-10-07",{styles:["kaftan"]}),
  studio("W-013","SM RSS0080","peach","Peach crinkle kurta set, beaded neckline","Peach crinkle fabric with a hand-beaded neckline","Kurta Sets","Embroidered sets",6000,"Crinkle","Peach","#F0B79A","Beadwork",["Festive"],["M / 38","L / 40"],[L("new","New arrival")],"2026-10-26",{styles:["embroidered"]}),
  studio("W-014","SM RSS0081","orange","Orange kurta set with palm-tree embroidery","Sunny orange with playful palm-tree embroidery","Kurta Sets","Embroidered sets",5410,"To confirm","Orange","#E2873A","Embroidery",["Festive"],["L / 40"],[L("new","New arrival")],"2026-10-25",{styles:["embroidered"]}),
  studio("W-015","SJ RSS0083","tealleaf","Teal leaf-print kurta set","A teal set in an all-over leaf print","Kurta Sets","Block print",4620,"Cotton","Teal","#2F7A77","Leaf print",["Everyday & office"],["M / 38","XL / 42"],[L("new","New arrival")],"2026-10-24",{styles:["ajrakh"]}),
  studio("W-016","SJ RSS0085","skyblue","Sky-blue embroidered anarkali set","Sky-blue anarkali with delicate embroidery","Kurta Sets","Anarkalis",2610,"To confirm","Sky blue","#9CC3E0","Embroidery",["Festive","Everyday & office"],["S / 36","M / 38"],[L("new","New arrival")],"2026-10-24",{styles:["anarkali","embroidered"]}),
  studio("W-017","SJ RSS0090","redikat","Red ikat-print kurta","A red kurta in a crisp ikat print","Kurtas","Straight kurtas",790,"Cotton","Red","#B23A36","Ikat print",["Everyday & office"],["M / 38","L / 40"],[L("new","New arrival")],"2026-10-23"),
  studio("W-018","SJ RSS0040","blackajrakh","Black kurta set with ajrakh dupatta","Solid black kurta paired with a hand-printed ajrakh dupatta","Kurta Sets","Block print",4620,"Cotton","Black","#2A2624","Ajrakh dupatta",["Everyday & office","Festive"],["L / 40"],[],"2026-10-10",{styles:["ajrakh"]}),
  studio("W-019","SJ RSS0041","bluewine","Blue and wine ajrakh set","Ajrakh print in blue and wine tones","Kurta Sets","Block print",4620,"Cotton","Blue","#3B4F86","Ajrakh block print",["Everyday & office"],["M / 38"],[],"2026-10-10",{styles:["ajrakh"]}),
  studio("W-020","SJ RSS0042","redblock","Red block-print kurta set","A red hand block-printed set for every day","Kurta Sets","Block print",2950,"Cotton","Red","#A8423B","Block print",["Everyday & office"],["S / 36","L / 40"],[],"2026-10-09",{styles:["ajrakh"]}),
  studio("W-021","SJ RSS0043","blackolive","Black and olive block-print set","Block print in black and olive","Kurta Sets","Block print",3360,"Cotton","Olive","#6B6B3A","Block print",["Everyday & office"],["M / 38"],[L("last_piece","Last piece")],"2026-10-09",{styles:["ajrakh"]}),
  studio("W-022","SM RSS0075","limeshirt","Lime shirt-kurta","A modern shirt-kurta in bright lime","Kurtas","Shirt kurtas",5160,"To confirm","Lime","#C9C775","Solid",["Everyday & office"],["L / 40"],[],"2026-10-13"),
  studio("S-001","SM RSS0131","saree-purple","Purple checked silk saree, contrast zari border","Purple checks with an orange zari border and an embroidered blouse","Sarees","Silk & occasion",7800,"Silk blend","Purple","#6B3F7A","Zari border",["Festive","Wedding guest"],["Free size"],[L("new","New at Sahasram")],"2026-10-27",{styles:["silk"]}),
  studio("S-002","SK RSS0147","saree-blue","Blue checked silk saree, gold zari border","Deep blue checks with a fine gold zari border","Sarees","Silk & occasion",9200,"Silk blend","Blue","#2F4F86","Gold zari",["Festive","Wedding guest"],["Free size"],[L("new","New at Sahasram")],"2026-10-27",{styles:["silk"]}),
  studio("S-003","SM RSS0152","saree-bandhani","Royal blue bandhani saree, zari pallu","Hand-tied bandhani in royal blue with a zari pallu","Sarees","Bandhani",8600,"Silk blend","Royal blue","#294A83","Bandhani · zari pallu",["Festive","Wedding guest"],["Free size"],[L("new","New at Sahasram")],"2026-10-27",{styles:["silk"]}),
  studio("K-001","SJ KSS0610","lehenga","Kids yellow floral lehenga-choli","A sunny floral lehenga-choli for little celebrations","Kids","Festive sets",2999,"To confirm","Yellow","#E9C14A","Floral print",[KIDS,"Festive"],["4-5Y"],[L("window","In our window this week"),L("last_piece","Last piece")],"2026-10-16",{styles:["kids"]}),
  studio("K-002","SJ KSS0615","nehru","Kids white quilted Nehru jacket","A quilted white Nehru jacket for festive days","Kids","Jackets",2700,"To confirm","White","#EDE8DF","Quilting",[KIDS,"Festive"],["6-7Y"],[L("new","New arrival")],"2026-10-25",{styles:["kids"]}),
  studio("K-003","SJ KSS0640","tiedye","Maaesa tie-dye bubble dress","A playful tie-dye bubble dress","Kids","Dresses",780,"Cotton","Multicolour","#C9A3C8","Tie-dye",[KIDS,"Everyday & office"],["2-3Y","3-4Y"],[L("bestseller","Kids favourite")],"2026-10-05",{styles:["kids"]}),
  studio("K-004","SJ KSS0677","rust","Maaesa rust peplum top","A rust peplum top for little ones","Kids","Tops",780,"Cotton","Rust","#A65A33","Solid",[KIDS,"Everyday & office"],["4-5Y"],[],"2026-10-04",{styles:["kids"]}),
];

// Synthetic preview catalogue only. These records are deliberately not presented as
// imported or verified Sahasram stock; replace them with the inventory-sheet import.
const previewRows = [
  // Quick ref, category, shelf, name, description, price, MRP, fabric, colour, work, occasions, sizes
  ["W-008","Kurta Sets","Straight sets","Mogra white printed kurta set","A crisp cotton set with a small floral repeat and an easy straight fit.",2490,2990,"Cotton","Ivory","Floral block print",["Everyday & office","Festive"],["S / 36","M / 38","L / 40"]],
  ["W-009","Kurta Sets","Straight sets","Terracotta mirror-work kurta set","Warm terracotta cotton with fine mirror accents at the yoke.",3890,4290,"Cotton","Terracotta","Mirror work",["Festive","Wedding guest"],["M / 38","L / 40","XL / 42"]],
  ["W-010","Kurta Sets","Anarkalis","Deep teal gathered anarkali set","A softly gathered silhouette finished with a light woven dupatta.",6290,6990,"Cotton silk","Teal","Woven border",["Festive","Wedding guest"],["S / 36","M / 38","XL / 42"]],
  ["W-011","Kurta Sets","Everyday sets","Indigo buti cotton kurta set","A breathable everyday set with tiny indigo motifs and tapered trousers.",2190,2190,"Cotton","Indigo","Dabu buti print",["Everyday & office"],["S / 36","M / 38","L / 40","XL / 42"]],
  ["W-012","Kurta Sets","Sharara sets","Marigold short kurta and sharara","A festive marigold set with a gently flared sharara and soft lining.",5490,5990,"Chanderi blend","Saffron","Thread embroidery",["Festive","Wedding guest"],["M / 38","L / 40"]],
  ["W-013","Kurta Sets","Straight sets","Mauve scallop-border kurta set","A muted mauve set with delicate scalloped edging at the dupatta.",4590,4990,"Viscose blend","Rosewood","Scallop embroidery",["Festive","Everyday & office"],["S / 36","M / 38","L / 40"]],
  ["W-014","Kurta Sets","Anarkalis","Rani pink foil-print anarkali","A celebratory pink anarkali with a light foil print and flowing hem.",4790,5290,"Rayon","Rani pink","Foil print",["Festive","Wedding guest"],["M / 38","L / 40","XL / 42"]],
  ["W-015","Kurta Sets","Everyday sets","Sage striped cotton co-ord","A relaxed sage co-ord with clean stripes for easy weekday dressing.",1990,2290,"Cotton","Sage","Yarn-dyed stripe",["Everyday & office"],["S / 36","M / 38","L / 40"]],
  ["W-016","Kurta Sets","Straight sets","Black and ecru Ajrakh set","A graphic Ajrakh-inspired print paired with a simple straight trouser.",3290,3690,"Cotton","Black","Ajrakh-inspired print",["Everyday & office","Festive"],["M / 38","L / 40","XL / 42"]],
  ["W-017","Kurta Sets","Anarkalis","Wine gota-patti anarkali set","A wine-toned festive set with fine gota accents and a sheer dupatta.",7490,8490,"Georgette","Wine","Gota patti",["Festive","Wedding guest"],["S / 36","M / 38"]],
  ["W-018","Kurta Sets","Straight sets","Powder blue chikankari-style set","Soft blue with delicate white threadwork and a light cotton lining.",4190,4690,"Cotton blend","Powder blue","White threadwork",["Festive","Everyday & office"],["M / 38","L / 40","XL / 42"]],
  ["W-019","Kurta Sets","Everyday sets","Rust floral yoke kurta set","A small floral print and a contrast yoke bring colour to this easy set.",1790,1990,"Rayon","Rust","Floral print",["Everyday & office"],["S / 36","M / 38","L / 40","XL / 42"]],
  ["W-020","Kurta Sets","Sharara sets","Emerald brocade sharara set","A jewel-toned occasion set with a brocade kurta and fluid sharara.",8990,9990,"Brocade silk blend","Emerald","Brocade weave",["Festive","Wedding guest"],["M / 38","L / 40"]],
  ["W-021","Kurta Sets","Straight sets","Lavender dori-work kurta set","Subtle lavender with fine dori detailing along the neckline.",3690,3990,"Cotton silk","Lavender","Dori work",["Festive","Everyday & office"],["S / 36","M / 38","L / 40"]],
  ["W-022","Kurta Sets","Anarkalis","Coral printed anarkali with dupatta","A bright coral print in a light, occasion-ready layered silhouette.",5890,6490,"Viscose","Coral","Floral print",["Festive","Wedding guest"],["M / 38","L / 40","XL / 42"]],
  ["W-023","Kurta Sets","Everyday sets","Olive hand-block kurta set","An earthy olive base with hand-block-inspired motifs and straight pants.",2690,2990,"Cotton","Olive","Hand block print",["Everyday & office"],["S / 36","M / 38","L / 40"]],
  ["W-024","Kurta Sets","Straight sets","Navy piping-detail kurta set","A deep navy set with contrast piping and a clean, versatile cut.",3190,3490,"Cotton satin","Navy","Contrast piping",["Everyday & office","Festive"],["M / 38","L / 40","XL / 42"]],
  ["W-025","Kurta Sets","Anarkalis","Peach kota-doria anarkali set","Airy kota-doria texture in peach, finished with a fine woven edge.",6990,7690,"Kota doria","Peach","Woven border",["Festive","Wedding guest"],["S / 36","M / 38"]],
  ["W-026","Kurta Sets","Straight sets","Mustard leheriya kurta set","A cheerful leheriya-inspired print with a lightweight matching dupatta.",3490,3890,"Cotton silk","Mustard","Leheriya print",["Festive","Everyday & office"],["M / 38","L / 40","XL / 42"]],
  ["W-027","Kurta Sets","Everyday sets","Charcoal pinstripe co-ord","A modern charcoal pinstripe set with a relaxed top and straight pants.",2890,3190,"Cotton blend","Charcoal","Pinstripe",["Everyday & office"],["S / 36","M / 38","L / 40"]],
  ["W-028","Kurta Sets","Straight sets","Turquoise mirror-yoke set","Turquoise cotton with hand-finished mirror details at the neckline.",4390,4890,"Cotton","Turquoise","Mirror work",["Festive","Wedding guest"],["M / 38","L / 40"]],
  ["W-029","Kurta Sets","Anarkalis","Cream-gold tissue anarkali set","A soft tissue-blend anarkali with a gentle gold sheen for celebrations.",7890,8890,"Tissue silk blend","Cream","Woven metallic detail",["Festive","Wedding guest"],["S / 36","M / 38","L / 40"]],
  ["W-030","Kurta Sets","Everyday sets","Mulberry printed cotton set","A deep mulberry print on breathable cotton, made for repeat wear.",2390,2690,"Cotton","Mulberry","Floral print",["Everyday & office","Festive"],["S / 36","M / 38","L / 40","XL / 42"]],
  ["W-031","Kurtas","Straight kurtas","White-on-white chikankari kurta","Fine white threadwork gives this breathable kurta a quiet, dressed-up feel.",2790,3190,"Cotton","Ivory","Chikankari-style threadwork",["Everyday & office","Festive"],["S / 36","M / 38","L / 40","XL / 42"]],
  ["W-032","Kurtas","Shirt kurtas","Indigo shirt kurta with contrast buttons","An easy shirt-inspired kurta in indigo cotton with contrast buttons.",1690,1890,"Cotton","Indigo","Hand block print",["Everyday & office"],["M / 38","L / 40","XL / 42"]],
  ["W-033","Kurtas","Straight kurtas","Rose printed A-line kurta","A light rose print and an easy A-line shape for all-day comfort.",1490,1690,"Rayon","Rosewood","Floral print",["Everyday & office"],["S / 36","M / 38","L / 40"]],
  ["W-034","Kurtas","Dresses & kaftans","Olive side-tie kaftan dress","A fluid kaftan with discreet side ties and a soft, matte finish.",2990,3290,"Viscose","Olive","Solid with contrast piping",["Everyday & office","Festive"],["Free size"]],
  ["W-035","Kurtas","Shirt kurtas","Rust slub-cotton longline kurta","Textured slub cotton and a longline cut make this a useful layering piece.",1890,2090,"Slub cotton","Rust","Solid",["Everyday & office"],["S / 36","M / 38","L / 40","XL / 42"]],
  ["W-036","Kurtas","Straight kurtas","Blue dabu-print kurta","A deep blue dabu-inspired print on breathable cotton with side slits.",1990,2290,"Cotton","Blue","Dabu print",["Everyday & office"],["M / 38","L / 40","XL / 42"]],
  ["W-037","Kurtas","Dresses & kaftans","Black and ivory kaftan tunic","A graphic monochrome tunic with a roomy drape and three-quarter sleeves.",2590,2890,"Viscose blend","Black","Geometric print",["Everyday & office","Festive"],["Free size"]],
  ["W-038","Kurtas","Straight kurtas","Saffron short kurta with tassels","A bright short kurta finished with small tassels and a printed yoke.",1290,1490,"Cotton","Saffron","Printed yoke",["Everyday & office","Festive"],["S / 36","M / 38","L / 40"]],
  ["W-039","Kurtas","Straight kurtas","Sage linen-blend tunic","A breathable linen-blend tunic with a neat collar and minimal detailing.",2290,2590,"Linen blend","Sage","Solid",["Everyday & office"],["M / 38","L / 40","XL / 42"]],
  ["S-004","Sarees","Kanjivaram-style","Maroon temple-border silk-blend sari","A maroon festive drape with a traditional temple-inspired border.",10900,11900,"Silk blend","Maroon","Temple zari border",["Festive","Wedding guest"],["Free size"]],
  ["S-005","Sarees","Cotton & handloom","Ivory and indigo handloom sari","A light handloom-style weave with an indigo border and understated checks.",4290,4790,"Cotton handloom","Ivory","Woven checks",["Everyday & office","Festive"],["Free size"]],
  ["S-006","Sarees","Bandhani","Fuchsia bandhani sari with contrast pallu","A lively fuchsia drape with bandhani-inspired dots and a contrast pallu.",6890,7490,"Georgette silk blend","Fuchsia","Bandhani print",["Festive","Wedding guest"],["Free size"]],
  ["S-007","Sarees","Kanjivaram-style","Green-and-gold korvai-border sari","An emerald-toned occasion sari with a broad gold-look woven edge.",12400,13900,"Silk blend","Emerald","Korvai-style border",["Festive","Wedding guest"],["Free size"]],
  ["S-008","Sarees","Printed & easy drape","Blush floral chiffon sari","A soft blush chiffon drape with a delicate floral print and light fall.",3690,4190,"Chiffon","Blush","Floral print",["Festive","Wedding guest"],["Free size"]],
  ["S-009","Sarees","Cotton & handloom","Mustard ajrakh cotton sari","A mustard cotton drape with an Ajrakh-inspired all-over print.",3890,4290,"Cotton","Mustard","Ajrakh-inspired print",["Everyday & office","Festive"],["Free size"]],
  ["S-010","Sarees","Organza & occasion","Lavender organza sari with pearl edge","Light lavender organza with a fine pearl-look edge for evening dressing.",8290,9290,"Organza","Lavender","Pearl-look edging",["Festive","Wedding guest"],["Free size"]],
  ["S-011","Sarees","Printed & easy drape","Black-and-copper printed sari","A dramatic black drape with a copper-toned print and matching blouse piece.",5490,5990,"Crepe blend","Black","Metallic print",["Festive","Wedding guest"],["Free size"]],
  ["S-012","Sarees","Cotton & handloom","Peacock blue pochampally-style sari","A geometric ikat-inspired weave in peacock blue with a contrast pallu.",7490,8290,"Silk-cotton blend","Peacock blue","Ikat-inspired weave",["Festive","Wedding guest"],["Free size"]],
  ["S-013","Sarees","Organza & occasion","Peach tissue sari with woven edge","A delicate peach tissue-blend sari with a soft sheen and narrow woven edge.",7890,8790,"Tissue blend","Peach","Woven edge",["Festive","Wedding guest"],["Free size"]],
  ["S-014","Sarees","Bandhani","Navy leheriya sari with zari-look border","A navy leheriya-inspired drape with a fine zari-look border.",6290,6990,"Georgette","Navy","Leheriya print",["Festive","Wedding guest"],["Free size"]],
  ["S-015","Sarees","Cotton & handloom","Rust and cream checks handloom sari","An earthy checked weave with a cream contrast border for versatile wear.",4690,5190,"Cotton handloom","Rust","Woven checks",["Everyday & office","Festive"],["Free size"]],
  ["K-008","Kids","Festive sets","Coral floral kids kurta set","A cheerful coral set with a soft cotton kurta and easy pull-on bottoms.",1490,1690,"Cotton","Coral","Floral print",["Kids’ celebrations"],["2Y","4Y","6Y"]],
  ["K-009","Kids","Festive sets","Ivory and gold kids kurta-dhoti set","An occasion-ready ivory set with gold-look woven accents and a soft dhoti.",2290,2590,"Cotton silk","Ivory","Woven detail",["Kids’ celebrations","Festive"],["2Y","4Y","6Y","8Y"]],
  ["K-010","Kids","Everyday sets","Blue animal-print cotton co-ord","A playful blue cotton co-ord with a small animal print for easy movement.",990,1190,"Cotton","Blue","Animal print",["Everyday & office","Kids’ celebrations"],["2Y","4Y","6Y","8Y"]],
  ["K-011","Kids","Festive sets","Mango yellow kurta and pajama set","A bright mango-yellow set with a simple woven collar for family occasions.",1790,1990,"Cotton blend","Saffron","Woven collar",["Kids’ celebrations","Festive"],["4Y","6Y","8Y"]],
  ["K-012","Kids","Everyday sets","Sage gingham kids tunic set","A soft gingham set with a relaxed tunic and comfortable elastic-waist bottoms.",1290,1490,"Cotton","Sage","Gingham checks",["Everyday & office","Kids’ celebrations"],["2Y","4Y","6Y"]],
  ["K-013","Kids","Festive sets","Berry embroidered kids lehenga set","A berry-toned celebration set with light embroidery and a comfortable lining.",2890,3290,"Art silk blend","Berry","Thread embroidery",["Kids’ celebrations","Festive","Wedding guest"],["4Y","6Y","8Y"]],
];

const makePreviewProduct = (row, index) => {
  const [quickRef, category, subCategory, name, shortDescription, price, mrp, fabric, color, work, occasion, sizeLabels] = row;
  const prefix = category === "Kids" ? "DK KSS" : category === "Sarees" ? "DM RSS" : index % 3 === 0 ? "DJ RSS" : "DM RSS";
  const sizes = sizeLabels.map((label, sizeIndex) => ({ label, available: (index + sizeIndex) % 5 === 0 ? 0 : 1 }));
  if (sizes.every(size => size.available === 0)) sizes[0].available = 1;
  const isNew = index % 8 === 0;
  return {
    id: quickRef, sku: `${prefix}${String(160 + index).padStart(4, "0")}`, quickRef, name, shortDescription,
    category, subCategory, price, mrp, currency: "INR", taxInclusive: true, fabric, color, work, occasion,
    sizes, imageUrls: [], onlineVisible: true, location: index % 6 === 0 ? "Exhibition stock" : "KPHB Studio",
    stockStatus: "in_stock", labels: isNew ? [{ kind: "new", text: "New arrival" }] : [],
    createdAt: `2026-10-${String(3 + index % 21).padStart(2, "0")}`,
    descriptors: [category, subCategory, fabric, color, work, ...occasion],
    shipsIn: "2–4 working days", setPieces: category === "Sarees" ? ["Sari", "Unstitched blouse piece"] : category === "Kids" ? ["Top", "Bottom"] : ["Kurta", "Bottom", ...(index % 2 ? ["Dupatta"] : [])],
  };
};

export const demoProducts = [...starterProducts, ...previewRows.map(makePreviewProduct)];

export const demoAppointments = [
  {id:"CALL-104",customerName:"Ananya Rao",purpose:"Shopping",mode:"WhatsApp video",date:"2026-10-25",slot:"12:30 PM",whatsapp:"+91 98••• 44120",products:["Lime pin-tuck anarkali set","Indigo drape anarkali set"],status:"New"},
  {id:"CALL-103",customerName:"Meera S.",purpose:"Fitting",mode:"Studio visit",date:"2026-10-25",slot:"4:00 PM",whatsapp:"+91 99••• 78114",products:["Rosewood embroidered kurta set"],status:"Scheduled"}
];

export const demoSummary = {
  grossSales: 86400, bills: 18, piecesSold: 23, averageBill: 4800, sellThroughPct: 62,
  onlineStock: demoProducts.filter(product => product.onlineVisible).reduce((total, product) => total + product.sizes.reduce((sum, size) => sum + size.available, 0), 0),
  appointmentsPending: demoAppointments.filter(appointment => appointment.status === "New").length,
};

