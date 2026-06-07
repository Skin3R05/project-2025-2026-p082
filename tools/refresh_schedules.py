import re
import os
import urllib.request
import pdfplumber

HORARIOS = "https://estig.ipb.pt/documents/3/Horarios.pdf"
EXAMS = "https://estig.ipb.pt/documents/2/program_schedules.pdf"
OUT = "Knowledge_Base/Schedules"
DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

def fetch(url, path):
    print("downloading", url)
    urllib.request.urlretrieve(url, path)

def row_time(label):
    m = re.match(r"(\d{1,2}:\d{2})", label or "")
    return m.group(1) if m else None

def prog_year(line):
    t = re.sub(r"\s*Horarios.*$", "", line).strip()
    m = re.search(r"-\s*(\d)\s*[ºn]?\s*ano", t)
    name = re.sub(r"\s*-\s*\d.*$", "", t).strip()
    return name, (m.group(1) if m else ""), t

def slug(s):
    return re.sub(r"[^A-Za-z0-9]+", "_", s).strip("_").lower()[:60]

def parse_legend(legend):
    codes = {}
    for m in re.finditer(r"([A-Za-z][A-Za-z0-9_]*)\s*-\s*(.+?)(?=\s+[A-Za-z][A-Za-z0-9_]*\s*-\s|$)", legend):
        codes[m.group(1)] = m.group(2).strip()
    return codes

def named(cell, codes):
    m = re.match(r"(\S+)\s*(\[.*)", cell)
    if m and m.group(1) in codes:
        return codes[m.group(1)] + " " + m.group(2)
    return cell

def parse_timetable(page):
    text = page.extract_text() or ""
    name, year, full = prog_year(text.split("\n", 1)[0])
    grid = page.extract_table()
    if not grid:
        return name, year, full, {}, ""
    legend = " ".join(l.strip() for l in text.split("\n")
                      if " - " in l and "Horarios" not in l and not re.match(r"\s*\d{1,2}:\d{2}", l))
    codes = parse_legend(legend)
    nrows, days = len(grid), {}
    for d in range(1, min(7, len(grid[0]))):
        entries, i = [], 1
        while i < nrows:
            cell = (grid[i][d] or "").replace("\n", " ").strip()
            if cell and "[" in cell:
                t, room, j = row_time(grid[i][0]), "", i + 1
                while j < min(i + 5, nrows):
                    c2 = (grid[j][d] or "").replace("\n", " ").strip()
                    if c2 and "[" in c2:
                        break
                    if c2:
                        room = c2
                        break
                    j += 1
                content = named(cell, codes)
                if room:
                    content += " (room " + room + ")"
                entries.append((t, content))
                i = j + 1 if room else i + 1
            else:
                i += 1
        if entries:
            days[DAYS[d - 1]] = entries
    return name, year, full, days, legend

def parse_exam_row(cells):
    cells = [c for c in cells if c]
    date = next((c for c in cells if re.match(r"\d{4}-\d{2}-\d{2}$", c)), "")
    if not date or not cells:
        return None
    time = next((c for c in cells if re.match(r"\d{1,2}:\d{2}$", c)), "")
    year = next((c for c in cells if re.match(r"\d$", c)), "")
    room = cells[-1] if cells[-1] not in (date, time, year) else ""
    return {"subject": cells[0], "year": year, "date": date, "time": time, "room": room}

def main():
    os.makedirs(OUT, exist_ok=True)
    fetch(HORARIOS, "_horarios.pdf")
    fetch(EXAMS, "_progsched.pdf")

    exams = {}
    with pdfplumber.open("_progsched.pdf") as pdf:
        for page in pdf.pages:
            text = page.extract_text()
            if not text:
                continue
            name = prog_year(text.split("\n", 1)[0])[0]
            for r in (page.extract_table() or []):
                row = parse_exam_row([(c or "").replace("\n", " ").strip() for c in r])
                if row and row["subject"].lower() != "subject":
                    exams.setdefault(name, []).append(row)

    written = 0
    with pdfplumber.open("_horarios.pdf") as pdf:
        for page in pdf.pages:
            name, year, full, days, legend = parse_timetable(page)
            if not days:
                continue
            out = [f"ESTiG class schedule for {full} (academic year 2025/2026).", "",
                   "Weekly timetable - each entry is start time, subject [class type], and room:"]
            for day in DAYS:
                if day in days:
                    out.append(f"{day}: " + "; ".join(f"{t} {c}" for t, c in days[day]))
            ex = [r for r in exams.get(name, []) if not year or r["year"] == year]
            if ex:
                out += ["", "Exam dates (resit season / epoca de recurso):"]
                for r in ex:
                    out.append(f"- {r['subject']}: {r['date']} at {r['time']}, room {r['room']}".rstrip())
            open(os.path.join(OUT, slug(full) + ".txt"), "w", encoding="utf-8").write("\n".join(out) + "\n")
            written += 1

    os.remove("_horarios.pdf")
    os.remove("_progsched.pdf")
    print(f"wrote {written} schedule files to {OUT}")

if __name__ == "__main__":
    main()
