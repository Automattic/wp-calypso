import React, { useMemo } from 'react';
import { BLOCK_MAX_HEIGHT } from '../constants';
import BlockRendererContainer from './block-renderer-container';
import { usePatternsRendererContext } from './patterns-renderer-context';

interface Props {
	patternIds: string[];
	viewportWidth?: number;
}

const PatternsRenderer = ( { patternIds, viewportWidth }: Props ) => {
	const renderedPatterns = usePatternsRendererContext();
	const styles = useMemo(
		() =>
			patternIds
				.map( ( patternId ) => renderedPatterns[ patternId ] )
				.filter( Boolean )
				.flatMap( ( pattern ) => pattern.styles ),
		[ patternIds, renderedPatterns ]
	);

	return (
		<BlockRendererContainer
			styles={ styles }
			viewportWidth={ viewportWidth }
			maxHeight={ BLOCK_MAX_HEIGHT * patternIds.length }
		>
			<>
				{ patternIds
					.filter( ( patternId ) => !! renderedPatterns[ patternId ] )
					.map( ( patternId, index ) => (
						<div
							key={ `${ patternId }-${ index }` }
							data-position={ index }
							// eslint-disable-next-line react/no-danger
							dangerouslySetInnerHTML={ { __html: renderedPatterns[ patternId ].html } }
						/>
					) ) }
			</>
		</BlockRendererContainer>
	);
};

export default PatternsRenderer;
