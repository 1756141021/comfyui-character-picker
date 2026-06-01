import { app } from "../../../scripts/app.js";

const STYLE_ID = "franchise-pool-styles";

function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
        .fp-container {
            display: flex;
            flex-direction: column;
            gap: 4px;
            padding: 6px;
            font-family: sans-serif;
            font-size: 12px;
            color: #ddd;
            background: #1a1a1a;
            border-radius: 6px;
            max-height: 400px;
            overflow: hidden;
        }
        .fp-toolbar {
            display: flex;
            gap: 4px;
            align-items: center;
        }
        .fp-search {
            flex: 1;
            padding: 4px 8px;
            border: 1px solid #555;
            border-radius: 4px;
            background: #2a2a2a;
            color: #ddd;
            font-size: 12px;
            outline: none;
        }
        .fp-search:focus {
            border-color: #6cf;
        }
        .fp-search::placeholder {
            color: #777;
        }
        .fp-btn {
            padding: 3px 8px;
            border: 1px solid #555;
            border-radius: 4px;
            background: #333;
            color: #ccc;
            cursor: pointer;
            font-size: 11px;
            white-space: nowrap;
        }
        .fp-btn:hover {
            background: #444;
        }
        .fp-list {
            display: flex;
            flex-direction: column;
            gap: 2px;
            overflow-y: auto;
            max-height: 340px;
            scrollbar-width: thin;
            scrollbar-color: #555 #1a1a1a;
        }
        .fp-item {
            display: flex;
            align-items: center;
            gap: 6px;
            padding: 4px 8px;
            border-radius: 4px;
            cursor: pointer;
            user-select: none;
            transition: background 0.1s;
        }
        .fp-item:hover {
            background: #2a2a2a;
        }
        .fp-item[data-active="false"] {
            opacity: 0.5;
        }
        .fp-toggle {
            width: 14px;
            height: 14px;
            border-radius: 3px;
            border: 2px solid #666;
            flex-shrink: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.15s;
        }
        .fp-toggle[data-on="true"] {
            background: #4a9;
            border-color: #4a9;
        }
        .fp-toggle[data-on="true"]::after {
            content: "\\2713";
            color: #fff;
            font-size: 10px;
            font-weight: bold;
        }
        .fp-name {
            flex: 1;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        .fp-count {
            color: #888;
            font-size: 11px;
            flex-shrink: 0;
        }
        .fp-summary {
            font-size: 11px;
            color: #888;
            text-align: right;
            padding: 2px 4px;
        }
    `;
    document.head.appendChild(style);
}

function createFranchiseWidget(node, inputName, inputData) {
    injectStyles();

    const container = document.createElement("div");
    container.className = "fp-container";

    const defaultStr = inputData[1]?.default || "[]";
    let poolData;
    try {
        poolData = typeof defaultStr === "string" ? JSON.parse(defaultStr) : defaultStr;
    } catch {
        poolData = [];
    }

    let searchQuery = "";

    // --- Toolbar (created ONCE, never destroyed) ---
    const toolbar = document.createElement("div");
    toolbar.className = "fp-toolbar";

    const search = document.createElement("input");
    search.className = "fp-search";
    search.type = "text";
    search.placeholder = "Search (中文/English)...";
    search.addEventListener("input", (e) => {
        e.stopPropagation();
        searchQuery = e.target.value;
        renderList();
    });
    search.addEventListener("keydown", (e) => e.stopPropagation());
    search.addEventListener("keyup", (e) => e.stopPropagation());
    search.addEventListener("keypress", (e) => e.stopPropagation());

    const allBtn = document.createElement("button");
    allBtn.className = "fp-btn";
    allBtn.textContent = "All";
    allBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        poolData.forEach(f => f.active = true);
        updateValue();
        renderList();
    });

    const noneBtn = document.createElement("button");
    noneBtn.className = "fp-btn";
    noneBtn.textContent = "None";
    noneBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        poolData.forEach(f => f.active = false);
        updateValue();
        renderList();
    });

    toolbar.appendChild(search);
    toolbar.appendChild(allBtn);
    toolbar.appendChild(noneBtn);
    container.appendChild(toolbar);

    // --- List container (content rebuilt on filter/toggle) ---
    const listEl = document.createElement("div");
    listEl.className = "fp-list";
    container.appendChild(listEl);

    // --- Summary ---
    const summaryEl = document.createElement("div");
    summaryEl.className = "fp-summary";
    container.appendChild(summaryEl);

    function matchesQuery(franchise, q) {
        if (!q) return true;
        const name = (franchise.name || "").toLowerCase();
        const copyright = (franchise.copyright || "").toLowerCase().replace(/_/g, " ");
        return name.includes(q) || copyright.includes(q);
    }

    function renderList() {
        listEl.innerHTML = "";

        const q = searchQuery.trim().toLowerCase();
        const filtered = poolData.filter(f => matchesQuery(f, q));

        for (const franchise of filtered) {
            const item = document.createElement("div");
            item.className = "fp-item";
            item.dataset.active = String(franchise.active);

            const toggle = document.createElement("div");
            toggle.className = "fp-toggle";
            toggle.dataset.on = String(franchise.active);

            const nameSpan = document.createElement("span");
            nameSpan.className = "fp-name";
            nameSpan.textContent = franchise.name;

            const countSpan = document.createElement("span");
            countSpan.className = "fp-count";
            countSpan.textContent = String(franchise.count || 0);

            item.addEventListener("click", (e) => {
                e.stopPropagation();
                franchise.active = !franchise.active;
                updateValue();
                renderList();
            });

            item.appendChild(toggle);
            item.appendChild(nameSpan);
            item.appendChild(countSpan);
            listEl.appendChild(item);
        }

        const activeCount = poolData.filter(f => f.active).length;
        const totalChars = poolData.filter(f => f.active).reduce((s, f) => s + (f.count || 0), 0);
        summaryEl.textContent = `${activeCount}/${poolData.length} franchises · ${totalChars} characters`;
    }

    function updateValue() {
        widget.value = JSON.stringify(poolData, null, 0);
        if (typeof widget.callback === "function") {
            widget.callback(widget.value);
        }
    }

    const widget = node.addDOMWidget(inputName, "FRANCHISE_POOL", container, {
        getValue() {
            return JSON.stringify(poolData, null, 0);
        },
        setValue(v) {
            if (!v) return;
            try {
                const parsed = typeof v === "string" ? JSON.parse(v) : v;
                if (Array.isArray(parsed)) {
                    poolData = parsed;
                    renderList();
                }
            } catch {}
        },
        serialize: true,
        getMinHeight() {
            return 120;
        },
        getMaxHeight() {
            return 420;
        },
    });

    widget.value = JSON.stringify(poolData, null, 0);
    renderList();

    return { widget };
}

app.registerExtension({
    name: "comfyui.character-picker.franchise-pool",
    getCustomWidgets() {
        return {
            FRANCHISE_POOL(node, inputName, inputData) {
                return createFranchiseWidget(node, inputName, inputData);
            },
        };
    },
});
