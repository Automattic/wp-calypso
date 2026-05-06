import { InformativeFeatureClip } from './informative-feature-clip';
import { PromotionalFeatureClip } from './promotional-feature-clip';
import type { FeatureClipBrief } from './types';
import './style.scss';

export const COMPOSITION_ID = 'image-studio-feature-clip';

interface FeatureClipVideoProps {
	id?: string;
	brief: FeatureClipBrief;
}

/**
 * Top-level dispatcher. Picks a renderer based on the brief's style.
 * Renderers share the brief shape but differ in pacing, typography,
 * color grading, and audio bed.
 */
export function FeatureClipVideo( { id = COMPOSITION_ID, brief }: FeatureClipVideoProps ) {
	if ( brief.style === 'promotional-photo' ) {
		return <PromotionalFeatureClip id={ id } brief={ brief } />;
	}
	return <InformativeFeatureClip id={ id } brief={ brief } />;
}

export type { FeatureClipBrief } from './types';
