import { InformativeFeatureClip } from './informative-feature-clip';
import type { FeatureClipBrief } from './types';
import './style.scss';

// PromotionalFeatureClip is intentionally not imported here. Promotional-tone
// dispatch is dormant — reintroduce alongside a Type dropdown when the
// promotional treatment actually differs (faster pacing, energetic audio,
// warmer grade). Until then, every brief renders via the informative renderer.

export const COMPOSITION_ID = 'image-studio-feature-clip';

interface FeatureClipVideoProps {
	id?: string;
	brief: FeatureClipBrief;
}

/**
 * Top-level dispatcher. Currently only 'highlights' briefs hit this renderer
 * ('cinematic' goes through Veo, not EditFrame).
 */
export function FeatureClipVideo( { id = COMPOSITION_ID, brief }: FeatureClipVideoProps ) {
	return <InformativeFeatureClip id={ id } brief={ brief } />;
}

export type { FeatureClipBrief } from './types';
