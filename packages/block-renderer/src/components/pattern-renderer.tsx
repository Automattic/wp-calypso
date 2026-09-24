import { memo, useMemo } from 'react';
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

	const patternStyles = useMemo( () => {
		let mergedStyles = [ ...styles, ...( pattern?.styles ?? [] ) ];
		if ( shouldShufflePosts ) {
			const css = shufflePosts( patternId, patternHtml );
			mergedStyles = [ ...mergedStyles, { css } as RenderedStyle ];
		}
		return mergedStyles;
	}, [ styles, pattern?.styles, shouldShufflePosts, patternId, patternHtml ] );

	const patternScripts = [ pattern?.scripts ?? '', scripts ];

	// React 19 reassigns `innerHTML` whenever the `dangerouslySetInnerHTML` object identity
	// changes, even when `__html` holds the same string. An inline object here would wipe and
	// re-parse the pattern on every render, re-fetching all of its images in a loop.
	const patternHtmlMarkup = useMemo( () => ( { __html: patternHtml } ), [ patternHtml ] );

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
				dangerouslySetInnerHTML={ patternHtmlMarkup }
			/>
		</BlockRendererContainer>
	);
};

export default memo( PatternRenderer );
