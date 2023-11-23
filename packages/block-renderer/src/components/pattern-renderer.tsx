import { memo } from 'react';
import { normalizeMinHeight } from '../html-transformers';
import shufflePosts from '../styles-transformers/shuffle-posts';
import BlockRendererContainer from './block-renderer-container';
import { usePatternsRendererContext } from './patterns-renderer-context';

interface Props {
	patternId: string;
	viewportWidth?: number;
	viewportHeight?: number;
	minHeight?: number;
	maxHeight?: 'none' | number;
	transformHtml?: ( patternHtml: string ) => string;
	shouldShufflePosts: boolean;
}

const PatternRenderer = ( {
	patternId,
	viewportWidth,
	viewportHeight,
	minHeight,
	maxHeight,
	transformHtml,
	shouldShufflePosts,
}: Props ) => {
	const renderedPatterns = usePatternsRendererContext();
	const pattern = renderedPatterns[ patternId ];

	let patternHtml = pattern?.html ?? '';
	if ( viewportHeight ) {
		patternHtml = normalizeMinHeight( patternHtml, viewportHeight );
	}
	if ( transformHtml ) {
		patternHtml = transformHtml( patternHtml );
	}

	// TODO(fushar): refactor this similar to how we refactor html transformations above.
	const inlineCss = shufflePosts( patternId, patternHtml, shouldShufflePosts );

	return (
		<BlockRendererContainer
			key={ pattern?.ID }
			styles={ pattern?.styles ?? [] }
			scripts={ pattern?.scripts ?? '' }
			viewportWidth={ viewportWidth }
			maxHeight={ maxHeight }
			minHeight={ minHeight }
			inlineCss={ inlineCss }
		>
			<div
				// eslint-disable-next-line react/no-danger
				dangerouslySetInnerHTML={ { __html: patternHtml } }
			/>
		</BlockRendererContainer>
	);
};

export default memo( PatternRenderer );
