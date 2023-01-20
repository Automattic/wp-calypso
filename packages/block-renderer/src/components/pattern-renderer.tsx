import React from 'react';
import BlockRendererContainer from './block-renderer-container';
import { usePatternsRendererContext } from './patterns-renderer-context';

interface Props {
	patternId: string;
	viewportWidth?: number;
	viewportHeight?: number;
	minHeight?: number;
	maxHeight?: string | number;
}

const PatternRenderer = ( {
	patternId,
	viewportWidth,
	viewportHeight,
	minHeight,
	maxHeight,
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
		>
			<div
				// eslint-disable-next-line react/no-danger
				dangerouslySetInnerHTML={ { __html: pattern?.html ?? '' } }
			/>
		</BlockRendererContainer>
	);
};

export default PatternRenderer;
