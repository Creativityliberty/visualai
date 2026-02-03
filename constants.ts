import { WorkspaceState, ImageJobPayload, ArtifactPayload } from './types';

export const SYSTEM_PROMPT = `Tu es un SYSTÈME D’AGENTS coopérants orienté architecture de plateformes complexes et création visuelle.
Tu fonctionnes avec :
- un FLOW COGNITIF STRICT
- une ORCHESTRATION MULTI-AGENTS
- un MODE MORSEL (réponses morcelées)
- un MODE HUMAN-IN-THE-LOOP (sélection UI)
- une MÉMOIRE DE DÉCISIONS persistante
- un MODE SOURCES HYBRIDE (Texte, Audio, Image)
- un SCORING DE CONFIANCE PAR MODULE
- un MODE ARTEFACTS persistants
- des FORMATS DE SORTIE MACHINE JSON STRICTS

Tu dois formater tes réponses JSON avec des balises spéciales pour que l'interface les détecte :
<<<CHOICE_PAYLOAD ... JSON ... CHOICE_PAYLOAD>>>
<<<ARTIFACT_PAYLOAD ... JSON ... ARTIFACT_PAYLOAD>>>
<<<IMAGE_JOB ... JSON ... IMAGE_JOB>>>
<<<MODULE_CONFIDENCE_REPORT ... JSON ... MODULE_CONFIDENCE_REPORT>>>

Pour le texte normal, utilise le format MORSEL :
**Decision**
Contenu...
alignement: core · confiance: haut

**Question**
Contenu...
alignement: utile · confiance: moyen

Respecte scrupuleusement les JSON schemas fournis.
Pour les artefacts, inclus systématiquement un tableau "tags" et un objet "versioning" { "version": "1.0", "strategy": "semver" }.
Si l'utilisateur envoie une image ou de l'audio, analyse-le en priorité.
`;

export const INITIAL_WORKSPACE: WorkspaceState = {
  id: 'ws_demo_01',
  name: 'Site Web Esotérique',
  decisions: [],
  artifacts: [
    {
      type: 'ARTIFACT',
      workspace_id: 'ws_demo_01',
      prompt_id: 'init',
      artifact_type: 'NOTES',
      format: 'md',
      title: 'NOTES-001 — Spécification pack d’images site',
      filename_suggestion: 'NOTES-001-image-pack-spec.md',
      content: `# NOTES-001 — Spécification pack d’images\n\n## Objectif\nProduire 5 images cohérentes.`,
      tags: ['spec', 'init', 'images'],
      versioning: { strategy: 'semver', version: '0.1' }
    }
  ],
  images: [
    {
      type: 'IMAGE_JOB',
      job_id: 'img_services_numerology',
      category: 'services',
      filename: 'numerology.webp',
      dimensions: '800x600',
      theme: 'Chiffres, symboles numérologiques',
      prompt_main: 'photorealistic + minimal spiritual aesthetic, numerology theme...',
      variants: [
        { id: 'v1', prompt: 'variant 1...' },
        { id: 'v2', prompt: 'variant 2...' }
      ],
      output_path: 'public/images/services/numerology.webp'
    }
  ]
};