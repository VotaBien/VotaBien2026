import { defineCollection, z } from 'astro:content';

const candidatosCollection = defineCollection({
  type: 'content',
  schema: z.object({
    titulo: z.string().optional(),
    riesgo_adicional: z.enum(['ALTO', 'MEDIO', 'BAJO', 'NULO']).optional(),
    puntos_penalidad: z.number().default(0),
    familiares: z.array(z.object({
      nombre: z.string(),
      relacion: z.string(),
      cargo: z.string()
    })).optional()
  })
});

export const collections = {
  'candidatos': candidatosCollection,
};