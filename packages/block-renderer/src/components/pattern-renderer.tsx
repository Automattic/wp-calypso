import { memo } from 'react';
import { normalizeMinHeight } from '../html-transformers';
import { shufflePosts } from '../styles-transformers';
import BlockRendererContainer from './block-renderer-container';
import { usePatternsRendererContext } from './patterns-renderer-context';
import type { RenderedStyle } from '../types';

interface Props {
	maxHeight?: 'none' | number;
	minHeight?: number;
	patternId: string;
	scripts?: string;
	styles?: RenderedStyle[];
	transformHtml?: ( patternHtml: string ) => string;
	viewportHeight?: number;
	viewportWidth?: number;
}

const PatternRenderer = ( {
	maxHeight,
	minHeight,
	patternId,
	scripts = '',
	styles = [],
	transformHtml,
	viewportHeight,
	viewportWidth,
}: Props ) => {
	const { renderedPatterns, shouldShufflePosts } = usePatternsRendererContext();
	const pattern = renderedPatterns[ patternId ];

	let patternHtml = pattern?.html ?? '';
	if ( viewportHeight ) {
		patternHtml = normalizeMinHeight( patternHtml, viewportHeight );
	}
	if ( transformHtml ) {
		patternHtml = transformHtml( patternHtml );
	}

	let patternStyles = [ ...styles, ...( pattern?.styles ?? [] ) ];
	if ( shouldShufflePosts ) {
		const css = shufflePosts( patternId, patternHtml );
		patternStyles = [ ...patternStyles, { css } as RenderedStyle ];
	}

	const patternScripts = [ pattern?.scripts ?? '', scripts ];

	return (
		<BlockRendererContainer
			key={ pattern?.ID }
			styles={ patternStyles }
			scripts={ patternScripts.join( '' ) }
			viewportWidth={ viewportWidth }
			maxHeight={ maxHeight }
			minHeight={ minHeight }
		>
			<div
				// eslint-disable-next-line react/no-danger
				dangerouslySetInnerHTML={ { __html: patternHtml } }
			/>
		</BlockRendererContainer>
	);
};

export default memo( PatternRenderer );
