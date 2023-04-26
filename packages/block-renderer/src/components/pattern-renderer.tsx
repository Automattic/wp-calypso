import React from 'react';
import BlockRendererContainer from './block-renderer-container';
import { usePatternsRendererContext } from './patterns-renderer-context';

interface Props {
	patternId: string;
	viewportWidth?: number;
	viewportHeight?: number;
	minHeight?: number;
	maxHeight?: 'none' | number;
	minHeightFor100vh?: number;
	isContentOnly?: boolean;
}

const PatternRenderer = ( {
	patternId,
	viewportWidth,
	viewportHeight,
	minHeight,
	maxHeight,
	minHeightFor100vh,
	isContentOnly,
}: Props ) => {
	const renderedPatterns = usePatternsRendererContext();
	const pattern = renderedPatterns[ patternId ];
	const content = (
		<div
			// eslint-disable-next-line react/no-danger
			dangerouslySetInnerHTML={ { __html: pattern?.html ?? '' } }
		/>
	);

	if ( isContentOnly ) {
		return content;
	}

	return (
		<BlockRendererContainer
			styles={ pattern?.styles ?? [] }
			scripts={ pattern?.scripts ?? '' }
			viewportWidth={ viewportWidth }
			viewportHeight={ viewportHeight }
			maxHeight={ maxHeight }
			minHeight={ minHeight }
			isMinHeight100vh={ pattern?.html?.includes( 'min-height:100vh' ) }
			minHeightFor100vh={ minHeightFor100vh }
		>
			{ content }
		</BlockRendererContainer>
	);
};

export default PatternRenderer;
