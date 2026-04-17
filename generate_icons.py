#!/usr/bin/env python3
"""Generate simple PWA icons for FollowPro using PIL/Pillow"""
import os, sys

try:
    from PIL import Image, ImageDraw, ImageFont
except ImportError:
    os.system("pip install Pillow --break-system-packages -q")
    from PIL import Image, ImageDraw, ImageFont

os.makedirs("icons", exist_ok=True)

def make_icon(size):
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Background rounded rect
    r = size // 5
    bg_color = (13, 15, 20, 255)       # #0D0F14
    accent   = (79, 142, 247, 255)     # #4F8EF7
    
    # Draw rounded rectangle background
    draw.rounded_rectangle([0, 0, size-1, size-1], radius=r, fill=accent)
    
    # Inner card
    pad = size // 8
    draw.rounded_rectangle([pad, pad, size-pad, size-pad], radius=r//2, fill=bg_color)
    
    # Draw "FP" text
    font_size = size // 3
    try:
        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", font_size)
    except:
        font = ImageFont.load_default()
    
    text = "FP"
    bbox = draw.textbbox((0, 0), text, font=font)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    tx = (size - tw) // 2 - bbox[0]
    ty = (size - th) // 2 - bbox[1]
    draw.text((tx, ty), text, fill=accent, font=font)
    
    return img

for sz in [192, 512]:
    icon = make_icon(sz)
    path = f"icons/icon-{sz}.png"
    icon.save(path, "PNG")
    print(f"✓ Generated {path}")

print("All icons generated!")
