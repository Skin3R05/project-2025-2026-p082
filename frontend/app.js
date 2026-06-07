const GREETING = "👋 Hi! I'm **IPBot**, your assistant for the Polytechnic Institute of Bragança (IPB). Ask me about academic dates, regulations, tuition, scholarships, services, the schools or your class timetable — in any language. How can I help?";
const STORE = "ipbot_state_v3";
const AVATAR = "/assets/ipb_icon.png";

const ICONS = {
    plus: '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',
    send: '<path d="M12 19V5"/><path d="m5 12 7-7 7 7"/>',
    copy: '<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
    refresh: '<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>',
    pin: '<path d="M12 17v5"/><path d="M9 10.8a2 2 0 0 1-1.1 1.8l-1.8.9A2 2 0 0 0 5 15.2V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.8a2 2 0 0 0-1.1-1.8l-1.8-.9A2 2 0 0 1 15 10.8V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z"/>',
    trash: '<path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
    dots: '<circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.9 4.9 1.4 1.4"/><path d="m17.7 17.7 1.4 1.4"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.3 17.7-1.4 1.4"/><path d="m19.1 4.9-1.4 1.4"/>',
    moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
    folder: '<path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/>',
    folderPlus: '<path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/><line x1="12" y1="10" x2="12" y2="16"/><line x1="9" y1="13" x2="15" y2="13"/>',
    chevR: '<path d="m9 18 6-6-6-6"/>',
    chevD: '<path d="m6 9 6 6 6-6"/>',
    menu: '<line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="18" y2="18"/>',
    edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
    info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
    paperclip: '<path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/>',
    x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
    mapPin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>'
};

function ic(n, s = 18) {
    return `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICONS[n] || ""}</svg>`;
}

let state = {
    conversations: {},
    folders: {},
    current: null,
    counter: 0,
    theme: "light",
    sidebarW: 272,
    collapsed: false
};
let inputHistory = [],
    histIndex = -1,
    sending = false,
    openMenuEl = null;
const input = document.getElementById("input");
let attached = null;

function escapeHtml(s) {
    const d = document.createElement("div");
    d.textContent = s == null ? "" : s;
    return d.innerHTML;
}

// persistence
function load() {
    try {
        const raw = localStorage.getItem(STORE);
        if (raw) state = Object.assign(state, JSON.parse(raw));
    } catch (e) {}
    if (!state.folders) state.folders = {};
    if (!state.conversations || !Object.keys(state.conversations).length) newChat(false);
    if (!state.current || !state.conversations[state.current]) state.current = Object.keys(state.conversations)[0];
    inputHistory = [];
    for (const c of Object.values(state.conversations))
        for (const m of c.messages)
            if (m.role === "user") inputHistory.push(m.content);
    histIndex = -1;
}

function save() {
    try {
        localStorage.setItem(STORE, JSON.stringify(state));
    } catch (e) {}
}

// folders
function chatFolder(id) {
    for (const f of Object.values(state.folders))
        if (f.chats.includes(id)) return f;
    return null;
}

function removeFromFolders(id) {
    for (const fid of Object.keys(state.folders)) {
        state.folders[fid].chats = state.folders[fid].chats.filter(c => c !== id);
        if (!state.folders[fid].chats.length) delete state.folders[fid];
    }
}

function addToFolder(id, fid) {
    removeFromFolders(id);
    if (state.folders[fid] && !state.folders[fid].chats.includes(id)) state.folders[fid].chats.push(id);
}

function newFolder() {
    newFolderWith(state.current);
}

function newFolderWith(chatId) {
    state.counter++;
    const fid = "f" + state.counter + "_" + Date.now();
    removeFromFolders(chatId);
    state.folders[fid] = {
        id: fid,
        name: "New folder",
        expanded: true,
        chats: [chatId]
    };
    save();
    renderSidebar();
}

function dropChatOnChat(dragged, target) {
    if (dragged === target) return;
    const tf = chatFolder(target);
    if (tf) {
        addToFolder(dragged, tf.id);
    } else {
        removeFromFolders(dragged);
        state.counter++;
        const fid = "f" + state.counter + "_" + Date.now();
        state.folders[fid] = {
            id: fid,
            name: "New folder",
            expanded: true,
            chats: [target, dragged]
        };
    }
    save();
    renderSidebar();
}

// chats
function newChat(doSave = true) {
    // clear out leftover empty chats, open a fresh one
    for (const id of Object.keys(state.conversations)) {
        if (!chatFolder(id) && state.conversations[id].messages.length <= 1) delete state.conversations[id];
    }
    state.counter = (state.counter || 0) + 1;
    const id = "c" + state.counter + "_" + Date.now();
    state.conversations[id] = {
        id,
        title: "New chat",
        pinned: false,
        messages: [{
            role: "assistant",
            content: GREETING,
            sources: []
        }]
    };
    state.current = id;
    if (doSave) {
        save();
        renderAll();
        collapseMobile();
        focusInput();
    }
}

function deleteChat(id) {
    removeFromFolders(id);
    delete state.conversations[id];
    if (!Object.keys(state.conversations).length) newChat(false);
    else if (state.current === id) state.current = Object.keys(state.conversations)[0];
    save();
    renderAll();
}

function deleteFolder(fid) {
    const f = state.folders[fid];
    if (!f) return;
    for (const cid of f.chats.slice()) delete state.conversations[cid];
    delete state.folders[fid];
    if (!Object.keys(state.conversations).length) newChat(false);
    else if (!state.conversations[state.current]) state.current = Object.keys(state.conversations)[0];
    save();
    renderAll();
}

function selectChat(id) {
    state.current = id;
    save();
    renderAll();
    collapseMobile();
    focusInput();
}

function pinChat(id) {
    const c = state.conversations[id];
    c.pinned = !c.pinned;
    save();
    renderSidebar();
}

function renameChat(id, name) {
    state.conversations[id].title = (name || "").trim() || "New chat";
    save();
    renderSidebar();
}

// sidebar
function renderSidebar() {
    const list = document.getElementById("chat-list");
    list.innerHTML = "";
    const inFolder = new Set();
    for (const f of Object.values(state.folders))
        for (const c of f.chats) inFolder.add(c);
    for (const fid of Object.keys(state.folders).reverse()) list.appendChild(renderFolder(state.folders[fid]));
    const loose = Object.keys(state.conversations).filter(id => !inFolder.has(id));
    const pinned = loose.filter(id => state.conversations[id].pinned).reverse();
    const rest = loose.filter(id => !state.conversations[id].pinned).reverse();
    for (const id of pinned.concat(rest)) list.appendChild(renderChatRow(id));
}

function renderFolder(f) {
    const wrap = document.createElement("div");
    const head = document.createElement("div");
    head.className = "folder-head";
    const chev = document.createElement("button");
    chev.className = "chev";
    chev.innerHTML = ic(f.expanded ? "chevD" : "chevR", 16);
    chev.onclick = () => {
        f.expanded = !f.expanded;
        save();
        renderSidebar();
    };
    const fic = document.createElement("span");
    fic.className = "ficon";
    fic.innerHTML = ic("folder", 16);
    const name = document.createElement("button");
    name.className = "name";
    name.textContent = f.name;
    name.onclick = () => {
        f.expanded = !f.expanded;
        save();
        renderSidebar();
    };
    name.ondblclick = (e) => {
        e.stopPropagation();
        startRename(name, f.name, v => {
            f.name = v || "Folder";
            save();
            renderSidebar();
        });
    };
    const dots = document.createElement("button");
    dots.className = "rowbtn";
    dots.innerHTML = ic("dots", 18);
    dots.onclick = (e) => {
        e.stopPropagation();
        openFolderMenu(f, head);
    };
    head.append(chev, fic, name, dots);
    head.ondragover = (e) => {
        e.preventDefault();
        head.classList.add("drop-target");
    };
    head.ondragleave = () => head.classList.remove("drop-target");
    head.ondrop = (e) => {
        e.preventDefault();
        head.classList.remove("drop-target");
        const id = e.dataTransfer.getData("chatId");
        if (id) {
            addToFolder(id, f.id);
            f.expanded = true;
            save();
            renderSidebar();
        }
    };
    wrap.appendChild(head);
    if (f.expanded) {
        const fc = document.createElement("div");
        fc.className = "folder-chats";
        for (const id of f.chats.slice().reverse())
            if (state.conversations[id]) fc.appendChild(renderChatRow(id));
        wrap.appendChild(fc);
    }
    return wrap;
}

function renderChatRow(id) {
    const c = state.conversations[id];
    const row = document.createElement("div");
    row.className = "row chat-row" + (id === state.current ? " active" : "");
    row.draggable = true;
    const name = document.createElement("button");
    name.className = "name";
    name.textContent = c.title || "New chat";
    name.onclick = () => selectChat(id);
    name.ondblclick = (e) => {
        e.stopPropagation();
        startRename(name, c.title, v => renameChat(id, v));
    };
    const pin = document.createElement("button");
    pin.className = "rowbtn" + (c.pinned ? " pinned" : "");
    pin.title = c.pinned ? "Unpin" : "Pin";
    pin.innerHTML = ic("pin", 15);
    pin.onclick = (e) => {
        e.stopPropagation();
        pinChat(id);
    };
    const dots = document.createElement("button");
    dots.className = "rowbtn";
    dots.innerHTML = ic("dots", 18);
    dots.onclick = (e) => {
        e.stopPropagation();
        openChatMenu(id, row);
    };
    row.append(name, pin, dots);
    row.ondragstart = (e) => {
        e.dataTransfer.setData("chatId", id);
        e.dataTransfer.effectAllowed = "move";
    };
    row.ondragover = (e) => {
        e.preventDefault();
        row.classList.add("drop-target");
    };
    row.ondragleave = () => row.classList.remove("drop-target");
    row.ondrop = (e) => {
        e.preventDefault();
        row.classList.remove("drop-target");
        const d = e.dataTransfer.getData("chatId");
        if (d) dropChatOnChat(d, id);
    };
    return row;
}

// menus
function openChatMenu(id, anchor) {
    closeMenu();
    const c = state.conversations[id];
    const menu = document.createElement("div");
    menu.className = "menu";
    menu.append(mbtn(ic("edit", 16) + "Rename", () => {
        closeMenu();
        startRename(anchor.querySelector(".name"), c.title, v => renameChat(id, v));
    }));
    menu.append(mbtn(ic("pin", 16) + (c.pinned ? "Unpin" : "Pin chat"), () => {
        pinChat(id);
        closeMenu();
    }));
    const here = chatFolder(id);
    menu.append(mbtn(ic("folderPlus", 16) + "New folder with this", () => {
        closeMenu();
        newFolderWith(id);
    }));
    for (const fid of Object.keys(state.folders)) {
        if (here && here.id === fid) continue;
        menu.append(mbtn(ic("folder", 16) + "Move to " + (state.folders[fid].name || "folder"), () => {
            addToFolder(id, fid);
            save();
            renderSidebar();
            closeMenu();
        }));
    }
    if (here) menu.append(mbtn(ic("folder", 16) + "Remove from folder", () => {
        removeFromFolders(id);
        save();
        renderSidebar();
        closeMenu();
    }));
    menu.append(mbtn(ic("trash", 16) + "Delete chat", () => {
        deleteChat(id);
        closeMenu();
    }, true));
    positionMenu(menu, anchor);
}

function openFolderMenu(f, anchor) {
    closeMenu();
    const menu = document.createElement("div");
    menu.className = "menu";
    menu.append(mbtn(ic("edit", 16) + "Rename folder", () => {
        closeMenu();
        startRename(anchor.querySelector(".name"), f.name, v => {
            f.name = v || "Folder";
            save();
            renderSidebar();
        });
    }));
    menu.append(mbtn(ic("trash", 16) + "Delete folder & chats", () => {
        deleteFolder(f.id);
        closeMenu();
    }, true));
    positionMenu(menu, anchor);
}

function mbtn(html, onClick, danger) {
    const b = document.createElement("button");
    if (danger) b.className = "danger";
    b.innerHTML = html;
    b.onclick = onClick;
    return b;
}

function positionMenu(menu, anchor) {
    document.body.appendChild(menu);
    const r = anchor.getBoundingClientRect();
    const mw = menu.offsetWidth,
        mh = menu.offsetHeight;
    let left = Math.max(8, Math.min(r.right - mw, window.innerWidth - mw - 8));
    let top = r.bottom + 4;
    if (top + mh > window.innerHeight - 8) top = Math.max(8, r.top - mh - 4);
    menu.style.left = left + "px";
    menu.style.top = top + "px";
    openMenuEl = menu;
}

function closeMenu() {
    if (openMenuEl) {
        openMenuEl.remove();
        openMenuEl = null;
    }
}
document.addEventListener("click", (e) => {
    if (openMenuEl && !openMenuEl.contains(e.target)) closeMenu();
}, true);

// rename
function startRename(nameEl, current, onSave) {
    const inp = document.createElement("input");
    inp.className = "rename-input";
    inp.value = current || "";
    nameEl.parentNode.replaceChild(inp, nameEl);
    inp.focus();
    inp.select();
    let done = false;
    const finish = (commit) => {
        if (done) return;
        done = true;
        if (commit) onSave(inp.value.trim());
        else renderSidebar();
    };
    inp.onkeydown = (e) => {
        if (e.key === "Enter") finish(true);
        else if (e.key === "Escape") finish(false);
    };
    inp.onblur = () => finish(true);
}

// messages
if (window.DOMPurify) DOMPurify.addHook("afterSanitizeAttributes", (n) => {
    if (n.tagName === "A") {
        n.setAttribute("target", "_blank");
        n.setAttribute("rel", "noopener noreferrer");
    }
});

function mdToHtml(t) {
    try {
        return DOMPurify.sanitize(marked.parse(t));
    } catch (e) {
        return t;
    }
}

function enhanceBubble(bubble, col) {
    const places = [];
    bubble.querySelectorAll("a").forEach(a => {
        const href = a.getAttribute("href") || "";
        if (/google\.[a-z.]+\/maps|maps\.google|maps\.apple/.test(href)) {
            let q = "";
            try {
                const u = new URL(href);
                q = u.searchParams.get("query") || u.searchParams.get("q") || u.searchParams.get("daddr") || "";
            } catch (e) {}
            if (!q) {
                const m = href.match(/(?:query=|[?&]q=)([^&]+)/);
                if (m) try {
                    q = decodeURIComponent(m[1]);
                } catch (e) {
                    q = m[1];
                }
            }
            q = (q || "this location").replace(/\+/g, " ").trim();
            if (places.indexOf(q) < 0) places.push(q);
            a.textContent = "📍 Open in Google Maps";
            a.classList.add("map-link");
        } else if ((a.textContent || "").trim() === href && href.length > 32) {
            try {
                a.textContent = new URL(href).hostname.replace(/^www\./, "") + " ↗";
            } catch (e) {}
        }
    });
    places.forEach(q => col.appendChild(mapCard(q)));
}
const IPB_PLACES = [{
        re: /sa[uú]de|afonso/i,
        lat: 41.8053,
        lon: -6.7592
    },
    {
        re: /mirandela|esact|comunica|administra|turismo/i,
        lat: 41.4906,
        lon: -7.1836
    }
];

function mapCard(query) {
    const card = document.createElement("div");
    card.className = "map-card";
    let lat = 41.7967,
        lon = -6.7656;
    for (const p of IPB_PLACES)
        if (p.re.test(query)) {
            lat = p.lat;
            lon = p.lon;
            break;
        }
    const d = 0.004,
        bbox = (lon - d) + "," + (lat - d) + "," + (lon + d) + "," + (lat + d);
    const frame = document.createElement("iframe");
    frame.className = "map-frame";
    frame.loading = "lazy";
    frame.src = "https://www.openstreetmap.org/export/embed.html?bbox=" + bbox + "&layer=mapnik&marker=" + lat + "," + lon;
    const bar = document.createElement("div");
    bar.className = "map-bar";
    const label = document.createElement("span");
    label.className = "map-place";
    label.innerHTML = ic("mapPin", 15) + "<span>" + escapeHtml(query) + "</span>";
    const open = document.createElement("a");
    open.className = "map-open";
    open.target = "_blank";
    open.rel = "noopener";
    open.href = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(query);
    open.textContent = "Open ↗";
    bar.append(label, open);
    card.append(frame, bar);
    return card;
}

function renderMessages() {
    const box = document.getElementById("messages");
    box.innerHTML = "";
    const chat = state.conversations[state.current];
    chat.messages.forEach((m, i) => box.appendChild(renderMsg(m, i)));
    scrollBottom();
}

function renderMsg(m, i) {
    const wrap = document.createElement("div");
    wrap.className = "msg " + m.role;
    if (m.role === "assistant") {
        const av = document.createElement("img");
        av.className = "avatar";
        av.src = AVATAR;
        wrap.appendChild(av);
    }
    const col = document.createElement("div");
    col.className = "col";
    const bubble = document.createElement("div");
    bubble.className = "bubble";
    if (m.role === "user") bubble.textContent = m.content;
    else bubble.innerHTML = mdToHtml(m.content);
    col.appendChild(bubble);
    if (m.role === "assistant") enhanceBubble(bubble, col);
    if (m.sources && m.sources.length) {
        const sd = document.createElement("div");
        sd.className = "sources";
        for (const s of m.sources) {
            const a = document.createElement("a");
            a.className = "chip";
            a.href = s.url;
            a.target = "_blank";
            a.rel = "noopener";
            a.textContent = s.label;
            sd.appendChild(a);
        }
        col.appendChild(sd);
    }
    if (m.doc) {
        const f = document.createElement("div");
        f.className = "msg-file";
        f.innerHTML = ic("paperclip", 13) + "<span>" + escapeHtml(m.doc.name) + "</span>";
        col.appendChild(f);
    }
    const actions = document.createElement("div");
    actions.className = "actions";
    const copy = document.createElement("button");
    copy.className = "action";
    copy.title = "Copy";
    copy.innerHTML = ic("copy", 16);
    copy.onclick = () => copyText(m.content, copy);
    actions.appendChild(copy);
    const chat = state.conversations[state.current];
    if (m.role === "assistant" && i === chat.messages.length - 1 && i >= 1) {
        const re = document.createElement("button");
        re.className = "action";
        re.title = "Regenerate";
        re.innerHTML = ic("refresh", 16);
        re.onclick = regenerate;
        actions.appendChild(re);
    }
    col.appendChild(actions);
    wrap.appendChild(col);
    return wrap;
}

function copyText(text, btn) {
    navigator.clipboard.writeText(text).then(() => {
        if (btn) {
            const o = btn.innerHTML;
            btn.textContent = "✓";
            setTimeout(() => btn.innerHTML = o, 1100);
        }
    }).catch(() => {});
}

// file upload
async function uploadFile(file) {
    const chip = document.getElementById("attach-chip");
    chip.classList.remove("hidden");
    chip.innerHTML = ic("paperclip", 14) + "<span>Reading " + escapeHtml(file.name) + "…</span>";
    const fd = new FormData();
    fd.append("file", file);
    try {
        const res = await fetch("/api/upload", {
            method: "POST",
            body: fd
        });
        const data = await res.json();
        if (!data.text) {
            showAttachError(data.error || "Could not read this file.");
            return;
        }
        attached = {
            name: data.name,
            text: data.text
        };
    } catch (e) {
        showAttachError("Upload failed.");
        return;
    }
    renderAttachChip();
}

function renderAttachChip() {
    const chip = document.getElementById("attach-chip");
    if (!attached) {
        chip.classList.add("hidden");
        chip.innerHTML = "";
        return;
    }
    chip.classList.remove("hidden");
    chip.innerHTML = ic("paperclip", 14) + "<span>" + escapeHtml(attached.name) + "</span>";
    const x = document.createElement("button");
    x.className = "chip-x";
    x.title = "Remove";
    x.innerHTML = ic("x", 14);
    x.onclick = () => {
        attached = null;
        renderAttachChip();
    };
    chip.appendChild(x);
}

function showAttachError(msg) {
    attached = null;
    const chip = document.getElementById("attach-chip");
    chip.classList.remove("hidden");
    chip.innerHTML = ic("paperclip", 14) + "<span>" + escapeHtml(msg) + "</span>";
    setTimeout(() => {
        if (!attached) renderAttachChip();
    }, 3500);
}

// chat flow
async function send(text) {
    text = (text || "").trim();
    if ((!text && !attached) || sending) return;
    const chat = state.conversations[state.current];
    const doc = attached;
    attached = null;
    renderAttachChip();
    const content = text || ("Please read this file: " + doc.name);
    if (chat.title === "New chat") chat.title = (text || doc.name).slice(0, 40);
    chat.messages.push({
        role: "user",
        content,
        sources: [],
        doc: doc ? {
            name: doc.name
        } : null,
        docText: doc ? doc.text : ""
    });
    if (text) {
        inputHistory.push(text);
        histIndex = -1;
    }
    save();
    renderSidebar();
    renderMessages();
    await ask();
}
async function ask() {
    const chat = state.conversations[state.current];
    sending = true;
    document.getElementById("send").disabled = true;
    const box = document.getElementById("messages");
    const t = document.createElement("div");
    t.className = "msg assistant";
    t.innerHTML = '<img class="avatar thinking-avatar" src="' + AVATAR + '"><div class="col"><div class="thinking-text">Thinking…</div></div>';
    box.appendChild(t);
    scrollBottom();
    const history = chat.messages.slice(0, -1).map(m => ({
        role: m.role,
        content: m.content
    }));
    const lastMsg = chat.messages[chat.messages.length - 1];
    let result;
    try {
        result = await chatAPI(lastMsg.content, history, lastMsg.docText || "");
    } catch (e) {
        result = {
            answer: "⚠️ Network error. Please try again.",
            sources: []
        };
    }
    chat.messages.push({
        role: "assistant",
        content: result.answer,
        sources: result.sources || []
    });
    sending = false;
    document.getElementById("send").disabled = false;
    save();
    renderMessages();
    focusInput();
}
async function regenerate() {
    const chat = state.conversations[state.current];
    if (chat.messages.length < 2 || sending) return;
    if (chat.messages[chat.messages.length - 1].role === "assistant") chat.messages.pop();
    save();
    renderMessages();
    await ask();
}
async function chatAPI(message, history, docText) {
    const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            message,
            history,
            doc_text: docText || ""
        })
    });
    return await res.json();
}

// ui helpers
function setTheme(t) {
    state.theme = t;
    document.documentElement.setAttribute("data-theme", t);
    document.getElementById("theme-toggle").innerHTML = ic(t === "dark" ? "sun" : "moon", 20);
    save();
}

function renderAll() {
    renderSidebar();
    renderMessages();
}

function scrollBottom() {
    const s = document.getElementById("scroll");
    s.scrollTop = s.scrollHeight;
}

function focusInput() {
    if (window.innerWidth > 760) try {
        input.focus();
    } catch (e) {}
}

function collapseMobile() {
    if (window.innerWidth <= 760) {
        state.collapsed = true;
        document.getElementById("app").classList.add("collapsed");
    }
}

function autoGrow() {
    input.style.height = "auto";
    input.style.height = Math.min(input.scrollHeight, 170) + "px";
}

function doSend() {
    const v = input.value;
    if (!v.trim() && !attached) return;
    const btn = document.getElementById("send");
    btn.classList.add("sending");
    setTimeout(() => btn.classList.remove("sending"), 500);
    input.value = "";
    autoGrow();
    histIndex = -1;
    send(v);
}

// inputs
input.addEventListener("input", () => {
    histIndex = -1;
    autoGrow();
});
input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        doSend();
    } else if (e.key === "ArrowUp" && (input.value === "" || histIndex !== -1)) {
        if (!inputHistory.length) return;
        e.preventDefault();
        histIndex = histIndex === -1 ? inputHistory.length - 1 : Math.max(0, histIndex - 1);
        input.value = inputHistory[histIndex];
        autoGrow();
    } else if (e.key === "ArrowDown" && histIndex !== -1) {
        e.preventDefault();
        if (histIndex < inputHistory.length - 1) {
            histIndex++;
            input.value = inputHistory[histIndex];
        } else {
            histIndex = -1;
            input.value = "";
        }
        autoGrow();
    }
});

// type or click anywhere to focus the message box
const overlayOpen = () => [...document.querySelectorAll(".modal")].some(m => !m.classList.contains("hidden"));
document.addEventListener("keydown", (e) => {
    const a = document.activeElement;
    if (a && (a.tagName === "INPUT" || a.tagName === "TEXTAREA" || a.isContentEditable)) return;
    if (e.ctrlKey || e.metaKey || e.altKey || e.key.length !== 1) return;
    if (overlayOpen()) return;
    input.focus();
});
document.addEventListener("click", (e) => {
    if (overlayOpen()) return;
    if (e.target.closest("button, a, input, textarea, select, label, .row, .folder-head, .menu, .chip, .action, .rowbtn, .sidebar")) return;
    if (window.getSelection && String(window.getSelection())) return;
    focusInput();
});

// resize
document.getElementById("resize").onmousedown = (e) => {
    e.preventDefault();
    const sx = e.clientX,
        sw = document.getElementById("sidebar").offsetWidth;
    const mv = (ev) => {
        let w = Math.max(200, Math.min(440, sw + ev.clientX - sx));
        state.sidebarW = w;
        document.documentElement.style.setProperty("--sidebar-w", w + "px");
    };
    const up = () => {
        document.removeEventListener("mousemove", mv);
        document.removeEventListener("mouseup", up);
        save();
    };
    document.addEventListener("mousemove", mv);
    document.addEventListener("mouseup", up);
};

// init
function init() {
    load();
    if (window.innerWidth <= 760) state.collapsed = true;
    document.documentElement.style.setProperty("--sidebar-w", (state.sidebarW || 272) + "px");
    document.getElementById("app").classList.toggle("collapsed", !!state.collapsed);
    setTheme(state.theme || "light");
    document.getElementById("send").innerHTML = ic("send", 18);
    document.getElementById("attach-btn").innerHTML = ic("paperclip", 18);
    document.getElementById("new-folder").innerHTML = ic("folderPlus", 18);
    document.getElementById("sidebar-toggle").innerHTML = ic("menu", 18);
    document.getElementById("about-btn").innerHTML = ic("info", 18);
    document.getElementById("new-chat").innerHTML = ic("plus", 18) + "<span>New Chat</span>";
    renderAll();
    document.getElementById("new-chat").onclick = () => newChat();
    document.getElementById("new-folder").onclick = newFolder;
    document.getElementById("theme-toggle").onclick = () => setTheme(state.theme === "dark" ? "light" : "dark");
    document.getElementById("send").onclick = doSend;
    document.getElementById("attach-btn").onclick = () => document.getElementById("file-input").click();
    document.getElementById("file-input").onchange = (e) => {
        const f = e.target.files[0];
        if (f) uploadFile(f);
        e.target.value = "";
    };
    document.getElementById("sidebar-toggle").onclick = () => {
        state.collapsed = !state.collapsed;
        document.getElementById("app").classList.toggle("collapsed", state.collapsed);
        save();
    };
    document.getElementById("about-btn").onclick = () => document.getElementById("about").classList.remove("hidden");
    document.getElementById("about-close").onclick = () => document.getElementById("about").classList.add("hidden");
    document.getElementById("backdrop").onclick = () => {
        state.collapsed = true;
        document.getElementById("app").classList.add("collapsed");
        save();
    };
    const MAIL = "devsaba05@gmail.com",
        SUBJ = "IPBot feedback";
    document.getElementById("report-btn").onclick = () => document.getElementById("report").classList.remove("hidden");
    document.getElementById("report-close").onclick = () => document.getElementById("report").classList.add("hidden");
    document.getElementById("report-copy").onclick = (e) => {
        navigator.clipboard.writeText(MAIL);
        const b = e.target,
            o = b.textContent;
        b.textContent = "Copied";
        setTimeout(() => b.textContent = o, 1200);
    };
    document.getElementById("report-gmail").href = "https://mail.google.com/mail/?view=cm&fs=1&to=" + MAIL + "&su=" + encodeURIComponent(SUBJ);
    document.getElementById("report-outlook").href = "https://outlook.office.com/mail/deeplink/compose?to=" + MAIL + "&subject=" + encodeURIComponent(SUBJ);
    document.getElementById("report-default").href = "mailto:" + MAIL + "?subject=" + encodeURIComponent(SUBJ);
    for (const id of ["about", "report"]) document.getElementById(id).onclick = (e) => {
        if (e.target.id === id) e.currentTarget.classList.add("hidden");
    };
    focusInput();
}
init();