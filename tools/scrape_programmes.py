import os
import re
import time
import json
from collections import Counter
import requests
from urllib.parse import urljoin

ROOT = "https://portalold.ipb.pt"
LIST = ROOT + "/index.php/pt/guiaects/cursos/licenciaturas"
OUT = "Knowledge_Base/Programmes"

SCHOOLS = {
    "3041": "Escola Superior Agraria (ESA)",
    "3042": "Escola Superior de Educacao (ESE)",
    "3043": "Escola Superior de Tecnologia e Gestao (ESTiG)",
    "3044": "Escola Superior de Saude (ESSa)",
    "3045": "Escola Superior de Comunicacao, Administracao e Turismo (EsACT, Mirandela)",
    "7015": "Escola Superior de Saude (ESSa)",
}

def clean(html):
    t = re.sub(r"<script.*?</script>|<style.*?</style>", " ", html, flags=re.S)
    t = re.sub(r"<[^>]+>", " ", t)
    t = t.replace("&nbsp;", " ").replace("&amp;", "&")
    t = re.sub(r"\s+", " ", t).strip()
    return t

def content_of(html):
    t = clean(html)
    i = t.find("Site IPB Google")
    if i >= 0:
        t = t[i + len("Site IPB Google"):].strip()
    for foot in ["Campus de Santa Apol", "Powered by", "Joomla"]:
        j = t.find(foot, 1000)
        if j > 1000:
            t = t[:j].strip()
            break
    return t

def slug(s):
    return re.sub(r"[^a-z0-9]+", "_", s.lower()).strip("_")[:60]

def main():
    os.makedirs(OUT, exist_ok=True)
    s = requests.Session()
    s.headers["User-Agent"] = "Mozilla/5.0"
    r = s.get(LIST, timeout=40)
    links = re.findall(r'href="([^"]+cod_escola=\d+[^"]*cod_curso=\d+[^"]*)"[^>]*>\s*([^<]+?)\s*<', r.text)
    seen, items = set(), []
    for href, name in links:
        href = href.replace("&amp;", "&")
        m = re.search(r"cod_escola=(\d+).*cod_curso=(\d+)", href)
        if not m or (m.group(1), m.group(2)) in seen:
            continue
        seen.add((m.group(1), m.group(2)))
        items.append((urljoin(ROOT, href), m.group(1), re.sub(r"\s+", " ", name).strip()))
    print("programmes found:", len(items))
    print("by school code:", dict(Counter(esc for _, esc, _ in items)))

    sources = {}
    for url, esc, name in items:
        try:
            body = content_of(s.get(url, timeout=40).text)
        except Exception as e:
            print("  error", name, e)
            continue
        if len(body) < 200:
            print("  thin", name)
            continue
        school = SCHOOLS.get(esc, "")
        head = f"Licenciatura (bachelor's degree) em {name} - IPB."
        if school:
            head += f" Taught at: {school}."
        head += f"\nProgramme page: {url}\n\n"
        fn = slug("lic_" + name) + ".txt"
        with open(os.path.join(OUT, fn), "w", encoding="utf-8") as f:
            f.write(head + body[:6500] + "\n")
        sources[fn] = url
        time.sleep(0.25)
    with open(os.path.join(OUT, "_sources.json"), "w", encoding="utf-8") as f:
        json.dump(sources, f, ensure_ascii=False, indent=0)
    print("wrote", len(sources), "programme files to", OUT)

if __name__ == "__main__":
    main()
