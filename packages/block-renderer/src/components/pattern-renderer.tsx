import { memo } from 'react';
import { normalizeMinHeight } from '../html-transformers';
import { shufflePosts } from '../styles-transformers';
import BlockRendererContainer from './block-renderer-container';
import { usePatternsRendererContext } from './patterns-renderer-context';
import type { RenderedStyle } from '../types';

interface Props {
	patternId: string;
	viewportWidth?: number;
	viewportHeight?: number;
	minHeight?: number;
	maxHeight?: 'none' | number;
	transformHtml?: ( patternHtml: string ) => string;
}

const PatternRenderer = ( {
	patternId,
	viewportWidth,
	viewportHeight,
	minHeight,
	maxHeight,
	transformHtml,
}: Props ) => {
	const { renderedPatterns, isNewSite } = usePatternsRendererContext();
	const pattern = renderedPatterns[ patternId ];

	let patternHtml = pattern?.html ?? '';
	if ( viewportHeight ) {
		patternHtml = normalizeMinHeight( patternHtml, viewportHeight );
	}
	if ( transformHtml ) {
		patternHtml = transformHtml( patternHtml );
	}

	let patternStyles = pattern?.styles ?? [];
	if ( isNewSite ) {
		const css = shufflePosts( patternId, pattern.html );
		patternStyles = [ ...patternStyles, { css } as RenderedStyle ];
	}

	return (
		<BlockRendererContainer
			key={ pattern?.ID }
			styles={ patternStyles }
			scripts={ pattern?.scripts ?? '' }
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
