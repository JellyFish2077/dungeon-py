import os,sys
os.chdir(r"C:\Users\JellyFish\Downloads\python-quiz-dev"); sys.path.insert(0,os.getcwd()); sys.path.insert(0,os.path.join(os.getcwd(),'tools'))
import verify_web, shot_itch
from playwright.sync_api import sync_playwright
JS="""() => { const out=new Set(); const root=document.querySelector('#codex-box')||document.body;
 const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,null,false); let n;
 while(n=w.nextNode()){ const p=n.parentElement; if(!p) continue;
  if(['SCRIPT','STYLE'].includes(p.tagName)) continue;
  if(!p.getClientRects().length) continue;
  const t=n.nodeValue.replace(/\s+/g,' ').trim(); if(/[А-Яа-яЁё]/.test(t)) out.add(t);} return [...out]; }"""
with sync_playwright() as pw:
    srv,base=verify_web.serve(); b=verify_web.launch(pw,"msedge"); shot_itch.LANG="en"
    p=shot_itch.new_page(b,dev=True)
    p.goto(base+"/game.html?menu=1&lang=en&debug=1",wait_until="domcontentloaded")
    p.wait_for_function("()=>window.PyMenu&&window.PyMenu.isOpen()",timeout=30000)
    p.evaluate("""()=>{const g=window.__pyquiz; const items={}; (window.__pyquiz && window.ITEM_POOL || []).forEach(i=>items[i.id]=1); const npcs={}; (window.VILLAGE_NPCS||[]).forEach(n=>npcs[n.key]=1); const enemies={}; (window.ENEMY_TYPES||[]).forEach(e=>enemies[e.key]=1); const bosses={}; Object.keys(window.BOSS_INFO||{}).forEach(k=>bosses[k]=1); g.codex={items,npcs,enemies,bosses};}""")
    p.click("#menu-codex"); p.wait_for_timeout(700)
    for tab in ("controls","items","npcs","mobs","bosses"):
        p.locator("[data-codex-tab='%s']"%tab).click(); p.wait_for_timeout(300)
        items=p.evaluate(JS)
        print("===",tab,len(items))
        for t in items[:40]: print("  "+t)
    p.screenshot(path="codex-en.tmp.png")
    b.close();srv.shutdown();srv.server_close()
