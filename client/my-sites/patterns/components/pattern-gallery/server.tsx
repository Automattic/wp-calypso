import classNames from 'classnames';
import { PatternPreviewPlaceholder } from 'calypso/my-sites/patterns/components/pattern-preview/placeholder';
import type { PatternGalleryFC } from 'calypso/my-sites/patterns/types';

import './style.scss';

export const PatternGalleryServer: PatternGalleryFC = ( { isGridView, patterns = [] } ) => {
	return (
		<div
			className={ classNames( 'pattern-gallery', {
				'pattern-gallery--grid': isGridView,
				'pattern-gallery--list': ! isGridView,
			} ) }
		>
			{ patterns?.map( ( pattern ) => (
				<PatternPreviewPlaceholder key={ pattern.ID } pattern={ pattern } />
			) ) }
		</div>
	);
};
