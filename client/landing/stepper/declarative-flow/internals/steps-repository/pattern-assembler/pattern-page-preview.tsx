import { PatternRenderer } from '@automattic/block-renderer';
import { CSSProperties, useMemo } from 'react';
import { encodePatternId } from './utils';
import type { Pattern } from './types';
import './pattern-page-preview.scss';

interface Props {
	title: string;
	style: CSSProperties;
	patterns: Pattern[];
	shouldShufflePosts: boolean;
}

const PATTERN_PAGE_PREVIEW_ITEM_VIEWPORT_HEIGHT = 500;
const PATTERN_PAGE_PREVIEW_ITEM_VIEWPORT_WIDTH = 1080;

const PatternPagePreview = ( { title, style, patterns, shouldShufflePosts }: Props ) => {
	const validPatterns = useMemo( () => patterns.filter( Boolean ) as Pattern[], [ patterns ] );

	return (
		<div className="pattern-assembler__preview">
			<div className="pattern-assembler__preview-frame">
				<div className="pattern-assembler__preview-frame-content" style={ style }>
					{ validPatterns.map( ( pattern ) => (
						<PatternRenderer
							key={ pattern.ID }
							patternId={ encodePatternId( pattern.ID ) }
							viewportWidth={ PATTERN_PAGE_PREVIEW_ITEM_VIEWPORT_WIDTH }
							viewportHeight={ PATTERN_PAGE_PREVIEW_ITEM_VIEWPORT_HEIGHT }
							shouldShufflePosts={ shouldShufflePosts }
						/>
					) ) }
				</div>
			</div>
			<div className="pattern-assembler__preview-title">{ title }</div>
		</div>
	);
};

export default PatternPagePreview;
