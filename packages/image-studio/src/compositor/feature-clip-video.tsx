import { InformativeFeatureClip } from './informative-feature-clip';
import type { FeatureClipBrief } from './types';
import './style.scss';

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
