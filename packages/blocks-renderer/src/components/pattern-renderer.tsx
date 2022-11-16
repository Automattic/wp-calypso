import React from 'react';
import BlocksRenderer from './blocks-renderer';
import { usePatternRendererContext } from './pattern-renderer-context';

interface Props {
	patternId: string;
	viewportWidth?: number;
}

const PatternRenderer = ( { patternId, viewportWidth = 1060 }: Props ) => {
	const renderedPatterns = usePatternRendererContext();
	const pattern = renderedPatterns[ patternId ];

	if ( ! pattern ) {
		return null;
	}

	return (
		<BlocksRenderer
			html={ pattern.html }
			styles={ pattern.styles }
			viewportWidth={ viewportWidth }
		/>
	);
};

export default PatternRenderer;
