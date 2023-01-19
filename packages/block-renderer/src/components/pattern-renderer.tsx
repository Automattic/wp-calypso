import React from 'react';
import { BLOCK_MAX_HEIGHT } from '../constants';
import BlockRendererContainer from './block-renderer-container';
import { usePatternsRendererContext } from './patterns-renderer-context';

interface Props {
	patternId: string;
	viewportWidth?: number;
	viewportHeight?: number;
	minHeight?: number;
}

const PatternRenderer = ( { patternId, viewportWidth, viewportHeight, minHeight }: Props ) => {
	const renderedPatterns = usePatternsRendererContext();
	const pattern = renderedPatterns[ patternId ];

	return (
		<BlockRendererContainer
			styles={ pattern?.styles ?? [] }
			viewportWidth={ viewportWidth }
			viewportHeight={ viewportHeight }
			maxHeight={ BLOCK_MAX_HEIGHT }
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
