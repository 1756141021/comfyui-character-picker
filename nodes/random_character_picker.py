import csv
import json
import os
import random
import re

_DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data")
_DB_PATH = os.path.join(_DATA_DIR, "characters.csv")

_FRANCHISE_TO_COPYRIGHT = {
    "绝区零": "zenless_zone_zero",
    "鸣潮": "wuthering_waves",
    "明日方舟": "arknights",
    "蔚蓝档案": "blue_archive",
    "碧蓝航线": "azur_lane",
    "妮姬": "nikke",
    "少女前线": "girls'_frontline",
    "少女前线2": "girls'_frontline_2:_exilium",
    "重返未来1999": "reverse:1999",
    "Fate": "fate",
    "碧蓝幻想": "granblue_fantasy",
    "赛马娘": "umamusume",
    "Limbus Company": "limbus_company",
    "异环": "neverness_to_everness",
    "终末地": "arknights:_endfield",
    "偶像大师": "idolmaster",
    "偶像大师CG": "idolmaster_cinderella_girls",
    "偶像大师SC": "idolmaster_shiny_colors",
    "学园偶像大师": "gakuen_idolmaster",
    "电锯人": "chainsaw_man",
    "葬送的芙莉莲": "sousou_no_frieren",
    "孤独摇滚": "bocchi_the_rock!",
    "别当欧尼酱了": "onii-chan_wa_oshimai!",
    "迷宫饭": "dungeon_meshi",
    "间谍过家家": "spy_x_family",
    "Elden Ring": "elden_ring",
}


def _tag_to_prompt(tag):
    """ganyu_(genshin_impact) -> ganyu \\(genshin impact\\)"""
    tag = tag.replace("_", " ")
    tag = tag.replace("(", r"\(").replace(")", r"\)")
    return tag


def _extract_copyright(franchise):
    return _FRANCHISE_TO_COPYRIGHT.get(franchise, "")


def _load_db():
    characters = []
    if not os.path.exists(_DB_PATH):
        return characters, []
    with open(_DB_PATH, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            characters.append({
                "danbooru_tag": row["danbooru_tag"],
                "base_tag": row["base_tag"],
                "is_variant": row["is_variant"] == "1",
                "franchise": row["franchise"],
                "post_count": int(row["post_count"]),
            })
    franchises = []
    counts = {}
    for c in characters:
        fr = c["franchise"]
        if fr not in counts:
            franchises.append(fr)
            counts[fr] = 0
        counts[fr] += 1
    franchise_info = [
        {"name": f, "copyright": _FRANCHISE_TO_COPYRIGHT.get(f, ""), "count": counts[f], "active": True}
        for f in franchises
    ]
    return characters, franchise_info


_ALL_CHARACTERS, _FRANCHISE_INFO = _load_db()


class RandomCharacterPicker:
    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "franchise_pool": ("FRANCHISE_POOL", {
                    "default": json.dumps(_FRANCHISE_INFO, ensure_ascii=False),
                }),
                "seed": ("INT", {
                    "default": 0,
                    "min": 0,
                    "max": 0xFFFFFFFFFFFFFFFF,
                    "tooltip": "Random seed. Set widget to 'randomize' for auto-change each run.",
                }),
            },
            "optional": {
                "mode": (["random", "specify"], {
                    "default": "random",
                    "tooltip": "random: pick by seed. specify: pick by character_name.",
                }),
                "character_name": ("STRING", {
                    "default": "",
                    "tooltip": "Pick a specific character (specify mode). Fuzzy match on danbooru_tag.",
                }),
            },
        }

    RETURN_TYPES = ("STRING", "STRING", "STRING", "STRING")
    RETURN_NAMES = ("prompt_tags", "danbooru_tag", "base_tag", "franchise")
    OUTPUT_TOOLTIPS = (
        "Comma-separated prompt tags: base, variant (if any), franchise copyright.",
        "The picked danbooru tag (base or variant).",
        "Base character tag.",
        "Franchise name.",
    )
    FUNCTION = "pick"
    CATEGORY = "character"

    @classmethod
    def IS_CHANGED(cls, **kwargs):
        return float("NaN")

    def pick(self, franchise_pool, seed, mode="random", character_name=""):
        if isinstance(franchise_pool, str):
            try:
                pool_data = json.loads(franchise_pool)
            except (json.JSONDecodeError, TypeError):
                pool_data = []
        else:
            pool_data = franchise_pool

        active_franchises = set()
        for entry in pool_data:
            if entry.get("active", True):
                active_franchises.add(entry["name"])

        if not active_franchises:
            return ("", "", "", "")

        characters = [c for c in _ALL_CHARACTERS if c["franchise"] in active_franchises]
        if not characters:
            return ("", "", "", "")

        char = None

        if mode == "specify" and character_name and character_name.strip():
            query = character_name.strip().lower().replace(" ", "_")
            starts = [c for c in characters if c["danbooru_tag"].lower().startswith(query)]
            contains = [c for c in characters if query in c["danbooru_tag"].lower()]
            candidates = starts or contains
            if candidates:
                candidates.sort(key=lambda c: (-int(c["post_count"]), len(c["danbooru_tag"])))
                char = candidates[0]
            if not char:
                return (f"Not found: {character_name}", "", "", "")
        else:
            rng = random.Random(seed)
            franchise_groups = {}
            for c in characters:
                franchise_groups.setdefault(c["franchise"], []).append(c)
            chosen_franchise = rng.choice(list(franchise_groups.keys()))
            group = franchise_groups[chosen_franchise]
            weights = [max(1, c["post_count"]) for c in group]
            char = rng.choices(group, weights=weights, k=1)[0]

        base_prompt = _tag_to_prompt(char["base_tag"])
        franchise = char["franchise"]
        copyright_tag = _extract_copyright(franchise)
        copyright_prompt = _tag_to_prompt(copyright_tag) if copyright_tag else ""

        parts = [base_prompt]
        if char["is_variant"]:
            parts.append(_tag_to_prompt(char["danbooru_tag"]))
        if copyright_prompt:
            parts.append(copyright_prompt)
        prompt_tags = ", ".join(parts)

        return (prompt_tags, char["danbooru_tag"], char["base_tag"], franchise)
