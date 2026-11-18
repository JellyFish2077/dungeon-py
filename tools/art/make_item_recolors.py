# -*- coding: utf-8 -*-
"""Новые иконки предметов: перекраска базовых спрайтов в другой оттенок.

Исходники лежат в tools/art/src и src_custom; результат кладём в
tools/art/src/items, чтобы build_art.py подхватил его как обычный слой.
"""
from pathlib import Path
from PIL import Image
import colorsys

# Путь считается от самого скрипта: иначе перекраска работала только на
# машине автора, а на другой копии репозитория искала несуществующую папку.
ROOT = Path(__file__).resolve().parent
SRC = ROOT / "src"
CUSTOM = ROOT / "src_custom"
OUT = SRC / "items"
OUT_GEAR = SRC / "equipment"


def find(rel):
    for root in (CUSTOM, SRC):
        p = root / rel
        if p.is_file():
            return p
    raise FileNotFoundError(rel)


def hue_shift(im, shift):
    im = im.convert("RGBA")
    px = im.load()
    w, h = im.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a == 0:
                continue
            hh, ll, ss = colorsys.rgb_to_hls(r / 255, g / 255, b / 255)
            hh = (hh + shift / 360.0) % 1.0
            r2, g2, b2 = colorsys.hls_to_rgb(hh, ll, ss)
            px[x, y] = (round(r2 * 255), round(g2 * 255), round(b2 * 255), a)
    return im


PLAN = [
    ("ember_blade.png", "items/ash_blade.png", 18),
    ("cinder_mail.png", "items/chainmail.png", 24),
    ("ember_heart.png", "items/ash_eye.png", 30),
    ("abyss_shield.png", "items/mirror_shield.png", 150),
    ("abyss_plate.png", "items/mirror_plate.png", 160),
    ("abyss_eye.png", "items/scout_lens.png", 180),
    ("dawn_spear.png", "items/trident_precise.png", 330),
    ("tower_shield.png", "items/round_shield.png", 200),
    ("master_seal.png", "items/ledger_amulet.png", 90),
    ("steadfast_draught.png", "items/purifying_draught.png", 45),
    # Обет зимы и Рассвет: новые сеты из существующих силуэтов.
    ("frost_axe.png", "items/ash_blade.png", 190),
    ("frost_bulwark.png", "items/steel_shield.png", 185),
    ("frost_heart.png", "items/serpent_ward.png", 175),
    ("dawn_buckler.png", "items/mirror_shield.png", 35),
    ("dawn_crown.png", "items/crown.png", 20),
]

OUT.mkdir(parents=True, exist_ok=True)
OUT_GEAR.mkdir(parents=True, exist_ok=True)
for name, rel, shift in PLAN:
    im = hue_shift(Image.open(find(rel)), shift)
    im.save(OUT / name)
    # Слой на герое: та же перекраска, но из worn-исходника.
    worn_rel = rel.replace("items/", "equipment/")
    try:
        worn = hue_shift(Image.open(find(worn_rel)), shift)
        worn.save(OUT_GEAR / name)
    except FileNotFoundError:
        print("нет worn-слоя:", worn_rel)
    print(name, im.size)
