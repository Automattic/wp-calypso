import classNames from 'classnames';
import { PatternPreviewPlaceholder } from 'calypso/my-sites/patterns/components/pattern-preview/placeholder';
import type { PatternGalleryFC } from 'calypso/my-sites/patterns/types';

import './style.scss';

export const PatternGalleryServer: PatternGalleryFC = ( { isGridView, patterns = [] } ) => {
	return (
		<div
			className={ classNames( 'pattern-gallery', {
				'pattern-gallery--grid': isGridView,
			} ) }
		>
			{ patterns?.map( ( pattern ) => (
				<PatternPreviewPlaceholder
					className={ classNames( {
						'pattern-preview--grid': isGridView,
						'pattern-preview--list': ! isGridView,
					} ) }
					key={ pattern.ID }
					pattern={ pattern }
				/>
			) ) }
		</div>
	);
};
