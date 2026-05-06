import { InformativeFeatureClip } from './informative-feature-clip';
import type { FeatureClipBrief } from './types';

interface PromotionalFeatureClipProps {
	id: string;
	brief: FeatureClipBrief;
}

/**
 * Promotional renderer — v1.1. Today this falls through to the informative
 * renderer so a `style: 'promotional-photo'` brief still produces output.
 * The bespoke promotional treatment (faster pacing, energetic audio,
 * heavier display typography, warmer color grading) lands in v1.1.
 */
export function PromotionalFeatureClip( { id, brief }: PromotionalFeatureClipProps ) {
	return <InformativeFeatureClip id={ id } brief={ brief } />;
}
