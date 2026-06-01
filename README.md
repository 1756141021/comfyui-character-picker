# ComfyUI Character Picker

Random anime/game character picker with franchise pool management for ComfyUI.

从 Danbooru 标签库随机抽取二次元角色，支持原作池开关管理。

## Features / 功能

- **9500+ characters** across 27 franchises, scraped from Danbooru (2026-05-31)
- **Franchise pool management** — toggle franchises on/off with a custom widget
- **Bilingual search** — search franchises in Chinese or English
- **Two-level random** — pick a franchise first, then a character (equal weight per franchise)
- **Base/variant separation** — skins and alts are tracked separately; picking a variant outputs both the variant tag and the base character tag
- **Prompt-ready output** — danbooru tags with proper escaping, comma-separated, ready for CLIP Text Encode

---

- **9500+ 角色标签**，覆盖 27 个作品，数据来自 Danbooru（2026-05-31 爬取）
- **原作池管理** — 自定义 widget，逐个开关原作
- **中英双语搜索** — 搜"蔚蓝"或"blue archive"都能找到
- **两层随机** — 先抽原作，再抽角色，每个原作被选中的概率相等
- **本体/变体分离** — 皮肤和异格单独记录，抽到变体同时输出本体标签
- **即用 prompt 输出** — danbooru 格式，转义括号，逗号分隔，直接拼进 positive prompt

## Supported Franchises / 支持的作品

| Franchise | Tags | Franchise | Tags |
|-----------|------|-----------|------|
| Fate 系列 | 3253 | 碧蓝航线 Azur Lane | 1502 |
| 明日方舟 Arknights | 1155 | 少女前线 Girls' Frontline | 672 |
| 赛马娘 Uma Musume | 597 | 蔚蓝档案 Blue Archive | 500 |
| 星穹铁道 Honkai: Star Rail | 381 | 妮姬 NIKKE | 266 |
| 碧蓝幻想 Granblue Fantasy | 264 | 赛马娘 Umamusume | 246 |
| 重返未来1999 Reverse: 1999 | 159 | 鸣潮 Wuthering Waves | 79 |
| 少女前线2 GFL2 | 73 | 绝区零 Zenless Zone Zero | 58 |
| 偶像大师CG iM@S CG | 49 | 孤独摇滚 Bocchi the Rock! | 38 |
| 偶像大师SC iM@S SC | 36 | 间谍过家家 Spy x Family | 36 |
| 终末地 Arknights: Endfield | 33 | 学园偶像大师 Gakuen iM@S | 32 |
| 电锯人 Chainsaw Man | 28 | 迷宫饭 Dungeon Meshi | 28 |
| 葬送的芙莉莲 Frieren | 27 | 别当欧尼酱了 Onimai | 26 |
| 偶像大师 iDOLM@STER | 18 | Elden Ring | 14 |
| Limbus Company | 1 | 异环 Neverness to Everness | — |

## Node Outputs / 节点输出

| Output | Description |
|--------|-------------|
| `prompt_tags` | Comma-separated danbooru tags: base character, variant (if any), copyright. Ready for positive prompt. |
| `danbooru_tag` | The picked tag (base or variant). |
| `base_tag` | Base character tag (same as danbooru_tag if base was picked). |
| `franchise` | Franchise name in Chinese. |

### Output Examples / 输出示例

**Base character picked:**
```
prompt_tags: ganyu \(genshin impact\), genshin impact
```

**Variant/skin picked:**
```
prompt_tags: bremerton \(azur lane\), bremerton \(scorching-hot training\) \(azur lane\), azur lane
```

## Installation / 安装

Clone into your ComfyUI custom nodes directory:

把仓库克隆到 ComfyUI 的 custom_nodes 目录下：

```bash
cd ComfyUI/custom_nodes
git clone https://github.com/1756141021/comfyui-character-picker.git
```

Restart ComfyUI. The node appears as **Random Character Picker** in the `character` category.

重启 ComfyUI，节点在 `character` 分类下。

## Usage / 使用

1. Add **Random Character Picker** node
2. Toggle franchises on/off in the widget
3. Set seed to `randomize` for a different character each run
4. Connect `prompt_tags` to your prompt or LLM node

---

1. 添加 **Random Character Picker** 节点
2. 在 widget 里开关你想要的原作
3. seed 设为 `randomize`，每次跑不同角色
4. 把 `prompt_tags` 接到 prompt 或 LLM 节点

## Data / 数据

- `data/characters.csv` — refined dataset (base character post count ≥ 100)
- `data/characters_raw.csv` — full dataset, no filtering
- Source: [Danbooru](https://danbooru.donmai.us/) + [deepghs/site_tags](https://huggingface.co/datasets/deepghs/site_tags)
- Scraped: 2026-05-31

## License

MIT
