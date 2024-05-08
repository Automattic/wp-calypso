import clsx from 'clsx';
import { PatternPreviewPlaceholder } from 'calypso/my-sites/patterns/components/pattern-preview/placeholder';
import type { PatternGalleryFC } from 'calypso/my-sites/patterns/types';

import './style.scss';

const PATTERNS_PER_PAGE_COUNT = 9;

export const PatternGalleryServer: PatternGalleryFC = ( { isGridView, patterns = [] } ) => {
	const patternsToDisplay = patterns.slice( 0, PATTERNS_PER_PAGE_COUNT );

	return (
		<div
			className={ clsx( 'pattern-gallery', {
				'pattern-gallery--grid': isGridView,
			} ) }
		>
			{ patternsToDisplay.map( ( pattern ) => (
				<PatternPreviewPlaceholder
					className={ clsx( {
						'pattern-preview--grid': isGridView,
						'pattern-preview--list': ! isGridView,
					} ) }
					key={ pattern.ID }
					title={ pattern.title }
				/>
			) ) }
		</div>
	);
};
