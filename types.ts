export interface Attachment {
  type: 'image' | 'audio';
  mimeType: string;
  data: string; // Base64
}

export interface Message {
  role: 'user' | 'model';
  content: string;
  timestamp: Date;
  payloads?: AnyPayload[];
  attachments?: Attachment[];
}

export type PayloadType = 'CHOICE' | 'ARTIFACT' | 'IMAGE_JOB' | 'CONFIDENCE';

export interface ChoiceOption {
  id: string;
  label: string;
  what_it_means: string;
  pros: string[];
  cons: string[];
  recommended: boolean;
  impact_tags?: string[];
}

export interface ChoicePayload {
  type: 'CHOICE';
  prompt_id: string;
  intent_core: string;
  required: boolean;
  selection_mode: 'single' | 'multi';
  choices: ChoiceOption[];
  next_on_select: string;
}

export interface ArtifactPayload {
  type: 'ARTIFACT';
  workspace_id: string;
  prompt_id: string;
  artifact_type: 'ADR' | 'ARCH' | 'PLAN' | 'NOTES';
  format: 'md' | 'txt';
  title: string;
  filename_suggestion: string;
  content: string;
  versioning?: { strategy: string; version?: string | number };
  tags?: string[];
}

export interface ImageVariant {
  id: string;
  prompt: string;
}

export interface ImageJobPayload {
  type: 'IMAGE_JOB';
  job_id: string;
  category: string;
  filename: string;
  dimensions: string;
  theme: string;
  prompt_main: string;
  variants: ImageVariant[];
  output_path: string;
}

export interface ConfidencePayload {
  type: 'CONFIDENCE';
  state: 'DRAFT' | 'DEGRADED' | 'STABLE';
  modules: Array<{
    name: string;
    score: number;
    risk_level: 'faible' | 'moyen' | 'élevé';
    reason: string;
  }>;
}

export type AnyPayload = ChoicePayload | ArtifactPayload | ImageJobPayload | ConfidencePayload;

export interface WorkspaceState {
  id: string;
  name: string;
  artifacts: ArtifactPayload[];
  images: ImageJobPayload[];
  decisions: Array<{ id: string; choice: string; timestamp: Date }>;
}