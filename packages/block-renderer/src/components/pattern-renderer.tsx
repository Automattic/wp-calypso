import React from 'react';
import BlockRendererContainer from './block-renderer-container';
import { usePatternsRendererContext } from './patterns-renderer-context';

interface Props {
	patternId: string;
	viewportWidth?: number;
	viewportHeight?: number;
	minHeight?: number;
	maxHeight?: string | number;
	maxHeightFor100vh?: number;
}

const PatternRenderer = ( {
	patternId,
	viewportWidth,
	viewportHeight,
	minHeight,
	maxHeight,
	maxHeightFor100vh,
}: Props ) => {
	const renderedPatterns = usePatternsRendererContext();
	const pattern = renderedPatterns[ patternId ];

	return (
		<BlockRendererContainer
			styles={ pattern?.styles ?? [] }
			viewportWidth={ viewportWidth }
			viewportHeight={ viewportHeight }
			maxHeight={ maxHeight }
			minHeight={ minHeight }
			isMinHeight100vh={ pattern?.html?.includes( 'min-height:100vh' ) }
			maxHeightFor100vh={ maxHeightFor100vh }
		>
			<div
				// eslint-disable-next-line react/no-danger
				dangerouslySetInnerHTML={ { __html: pattern?.html ?? '' } }
			/>
		</BlockRendererContainer>
	);
};

export default PatternRenderer;
