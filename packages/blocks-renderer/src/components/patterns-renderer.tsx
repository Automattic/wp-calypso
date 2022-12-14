import React, { useMemo } from 'react';
import { BLOCK_MAX_HEIGHT } from '../constants';
import BlocksRendererContainer from './blocks-renderer-container';
import { usePatternsRendererContext } from './patterns-renderer-context';

interface Props {
	patternIds: string[];
	viewportWidth?: number;
	enableDynamicViewport?: boolean;
}

const PatternsRenderer = ( { patternIds, viewportWidth = 1060, enableDynamicViewport }: Props ) => {
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
		<BlocksRendererContainer
			styles={ styles }
			viewportWidth={ viewportWidth }
			maxHeight={ BLOCK_MAX_HEIGHT * patternIds.length }
			enableDynamicViewport={ enableDynamicViewport }
		>
			{ patternIds.map( ( patternId, index ) => {
				const renderedPattern = renderedPatterns[ patternId ];
				if ( ! renderedPattern ) {
					return null;
				}

				return (
					<div
						key={ `${ patternId }-${ index }` }
						data-position={ index }
						// eslint-disable-next-line react/no-danger
						dangerouslySetInnerHTML={ { __html: renderedPattern.html } }
					/>
				);
			} ) }
		</BlocksRendererContainer>
	);
};

export default PatternsRenderer;
