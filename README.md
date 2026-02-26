# 🇵🇪 VotaBien 2026

**Plataforma de vigilancia ciudadana y voto informado.**

Este proyecto es una base de datos interactiva y de código abierto que permite filtrar, buscar y analizar el perfil de riesgo de los miles de candidatos al Precidencia, Senado, Parlamento Andino y Diputados (pendiente) del Perú para el proceso electoral 2026.

La plataforma cruza datos oficiales del JNE (Hoja de Vida) con **investigaciones periodísticas y ciudadanas** para calcular un "Puntaje de Confiabilidad".

---

## 🚀 Cómo colaborar

La parte más importante de este proyecto es la **fiscalización colectiva**. Tú puedes agregar investigaciones, sentencias no declaradas o vínculos familiares corruptos.

### Pasos para agregar una investigación:

1.  Entra a la carpeta: `src/content/candidatos/`.
2.  Crea un nuevo archivo con el formato: `DNI-nombre-del-caso.md`.
    * *Ejemplo:* `10203040-caso-odebrecht.md`
    * **Nota:** Es vital que el nombre del archivo empiece con el DNI exacto del candidato.
3.  Copia y pega la siguiente plantilla dentro del archivo (se pueden guiar con los existentes):

```markdown
---
titulo: "Título corto del caso (Ej: Caso Lavajato)"
riesgo_adicional: "ALTO"
puntos_penalidad: 3
familiares:
  - nombre: "Nombre del familiar"
    relacion: "Hermano/Hijo/Esposa"
    cargo: "Cargo que ocupa (si aplica)"
---

### Descripción
Resumen breve y objetivo de los hechos. Máximo 2 párrafos.

### Evidencia
Detalles específicos como número de expediente, partida registral o fechas clave.

> **Fuente:** [Enlace a la noticia o documento oficial](https://...)
```
