import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * Work / case studies collection.
 * Each markdown file in src/content/work/ becomes a page at /work/<filename>.
 * Filenames intentionally match the old Squarespace slugs so existing
 * links and search results keep working.
 */
const work = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/work' }),
  schema: ({ image }) =>
    z.object({
    title: z.string(),
    tagline: z.string(),
    client: z.string(),
    role: z.string(),
    skills: z.array(z.string()).default([]),
    /** Sort order on the Work index (lower = first) */
    order: z.number().default(99),
    /**
     * Cover image, resolved through Astro's asset pipeline (optimized,
     * responsive variants generated at build time). Use a path relative
     * to the markdown file, e.g. ../../assets/work/lotic/cover.png
     */
    cover: image().optional(),
    coverAlt: z.string().optional(),
    /** Set true to hide from the site without deleting the file */
    draft: z.boolean().default(false),

    /* ---- Case study detail fields ---- */
    /** Longer description shown below the title on the case study page */
    description: z.string().optional(),
    /** Role activities listed in the meta card (falls back to skills) */
    roleActivities: z.array(z.string()).default([]),
    /** Summary paragraph under the role title; when set, activities render inline */
    roleSummary: z.string().optional(),
    /** Team members listed in the meta card */
    team: z.array(z.string()).default([]),

    /* ---- Home page showcase fields ---- */
    /** Shorter title used on the home showcase row (falls back to title) */
    shortTitle: z.string().optional(),
    /** Category label shown after the client, e.g. "AI product" */
    category: z.string().optional(),
    /** Neutral tag chips on the showcase row */
    chips: z.array(z.string()).default([]),
    /** One accent-tinted chip — reserve for a headline metric */
    highlightChip: z.string().optional(),
    /** Featured = accent-tinted preview tile on the home showcase */
    featured: z.boolean().default(false),
  }),
});

export const collections = { work };
