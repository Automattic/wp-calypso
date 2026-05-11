import { Configuration } from '@editframe/react';
import { HighlightsFeatureClip } from './highlights-feature-clip';
import type { FeatureClipBrief } from './types';
import './style.scss';

export const COMPOSITION_ID = 'image-studio-feature-clip';

interface FeatureClipVideoProps {
	id?: string;
	brief: FeatureClipBrief;
}

// imageProxy="none" must be inside the cloned subtree — TimelineRoot's
// clone factory re-renders this component into a detached container during
// renderToVideo, and EFImage discovers the config via closest("ef-configuration")
// in the DOM. An <ef-configuration> ancestor outside the component is invisible
// to the clone.
export function FeatureClipVideo( { id = COMPOSITION_ID, brief }: FeatureClipVideoProps ) {
	return (
		<Configuration imageProxy="none">
			<HighlightsFeatureClip id={ id } brief={ brief } />
		</Configuration>
	);
}

export type { FeatureClipBrief } from './types';
