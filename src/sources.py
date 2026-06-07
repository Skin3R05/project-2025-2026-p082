# maps each knowledge base file to the official IPB web page it came from
SOURCE_URLS = {
    # Academic calendar
    "calendario_academico_2025-26.pdf": "https://webdocs.ipb.pt/portal/download?docId=40821",
    "calendar_2025-26_summary.txt": "https://ipb.pt/pt/estudar/estudantes/servicos-academicos/calendario-academico",
    "calendar_academic_2025-26_pt.pdf": "https://ipb.pt/pt/estudar/estudantes/servicos-academicos/calendario-academico",
    "calendar_academic_2026-27_pt.pdf": "https://ipb.pt/pt/estudar/estudantes/servicos-academicos/calendario-academico",
    "calendar_academic_education_2025-26_pt.pdf": "https://ipb.pt/pt/estudar/estudantes/servicos-academicos/calendario-academico",
    # ECTS / academic guides
    "guide_ects_system.txt": "https://portal3.ipb.pt/index.php/pt/guiaects",
    "guide_grading_scale.txt": "https://portal3.ipb.pt/index.php/pt/guiaects",
    "guide_crediting_rules.txt": "https://portal3.ipb.pt/index.php/pt/guiaects",
    "general_info.txt": "https://portal3.ipb.pt/index.php/pt/guiaects/informacoes-gerais-aos-alunos",
    "ipb_general_info.txt": "https://portal3.ipb.pt/index.php/pt/guiaects/informacoes-gerais-aos-alunos",
    "diploma_supplement.txt": "https://ipb.pt/pt/estudar/estudantes",
    # Tuition
    "propinas_2025-26_internacionais.pdf": "https://webdocs.ipb.pt/portal/download?docId=41058",
    "propinas_2025-26_nacionais.pdf": "https://webdocs.ipb.pt/portal/download?docId=41059",
    "tuition_2025-26_summary.txt": "https://ipb.pt/pt/estudar/candidaturas/propinas-e-emolumentos",
    "cost_of_living_ipb.txt": "http://portal3.ipb.pt/uploads/Brasil/Indicadores_de_custo_de_vida_e_de_estudo_no_IPB.pdf",
    # Regulations
    "regulamentos_ipb_indice.pdf": "https://webdocs.ipb.pt/portal/download?docId=40286",
    "regulamento_frequencia_avaliacao.pdf": "https://webdocs.ipb.pt/portal/download?docId=31612",
    "regulamento_matriculas_inscricoes.pdf": "https://esa.ipb.pt/wp-content/uploads/regulamentos/RegulamentoGeralMatriculaseInscricoes.pdf",
    "regulamento_ctesp.pdf": "https://webdocs.ipb.pt/portal/download?docId=7331",
    "regulamento_pedagogico_estig.pdf": "https://webdocs.ipb.pt/portal/download?docId=1465",
    "regulamento_pedagogico_esact.pdf": "https://webdocs.ipb.pt/portal/download?docId=11571",
    "regulamento_estagio_ese.pdf": "https://webdocs.ipb.pt/portal/download?docId=41119",
    # Schools
    "info_estig_guide.txt": "https://estig.ipb.pt",
    "school_of_agriculture.txt": "https://esa.ipb.pt",
    "school_of_education.txt": "https://www.ese.ipb.pt",
    "school_of_health.txt": "https://essa.ipb.pt",
    "school_of_public_management_communication_tourism.txt": "https://esact.ipb.pt",
    # International
    "erasmus_mobility_guide.txt": "https://ipb.pt/pt/internacionalizar/erasmus",
    "DIAGRAMASESPEN1.pdf": "https://ipb.pt/pt/internacionalizar",
    "NAR_ISNES_EN1.pdf": "https://ipb.pt/pt/internacionalizar",
    # Social services
    "about_SAS.txt": "https://sas.ipb.pt",
    "social_services_housing.txt": "https://sas.ipb.pt",
    "academic_services.txt": "https://ipb.pt/pt/estudar/estudantes/servicos-academicos",
    "regulamento_bolsas_estudo_2024.pdf": "https://files.diariodarepublica.pt/2s/2024/07/127000000/0006700101.pdf",
    # Reference / helpers
    "canteen.txt": "https://cantina-ipb.vercel.app/",
    "places_photos.txt": "https://cantina-ipb.vercel.app/",
    "schedules_by_school.txt": "https://sumarios.ipb.pt",
    "syllabus_grading.txt": "https://portal3.ipb.pt/index.php/pt/guiaects",
    "acronyms.txt": "https://ipb.pt/pt/estudar",
    "campus_map.txt": "https://www.google.com/maps/search/?api=1&query=Instituto+Polit%C3%A9cnico+de+Bragan%C3%A7a+Campus+de+Santa+Apol%C3%B3nia",
    "faculty_cedri.txt": "https://cedri.ipb.pt/people/integrated-members",
}

DEFAULT_URL = "https://ipb.pt"
SCHEDULE_URL = "https://estig.ipb.pt/documents/3/Horarios.pdf"

# deep links
import json
from pathlib import Path as _Path
try:
    _PROGRAMME_URLS = json.loads(
        (_Path(__file__).resolve().parent.parent / "Knowledge_Base" / "Programmes" / "_sources.json").read_text(encoding="utf-8"))
except Exception:
    _PROGRAMME_URLS = {}

def get_source_url(filename, category=""):
    if category == "Schedules":
        return SCHEDULE_URL
    if category == "Contacts":
        return DEFAULT_URL
    if filename in _PROGRAMME_URLS:
        return _PROGRAMME_URLS[filename]
    return SOURCE_URLS.get(filename, DEFAULT_URL)
