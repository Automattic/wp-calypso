import { BlockRendererProvider, PatternsRendererProvider } from '@automattic/block-renderer';
import classNames from 'classnames';
import { PatternGalleryServer } from 'calypso/my-sites/patterns/components/pattern-gallery/server';
import {
	DESKTOP_VIEWPORT_WIDTH,
	PatternPreview,
} from 'calypso/my-sites/patterns/components/pattern-preview';
import { RENDERER_SITE_ID } from 'calypso/my-sites/patterns/controller';
import { PatternTypeFilter, type PatternGalleryFC } from 'calypso/my-sites/patterns/types';
import { useSelector } from 'calypso/state';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';

import './style.scss';

const LOGGED_OUT_USERS_CAN_COPY_COUNT = 3;

export const PatternGalleryClient: PatternGalleryFC = ( props ) => {
	const { getPatternPermalink, isGridView, patterns = [], patternTypeFilter } = props;
	const isLoggedIn = useSelector( isUserLoggedIn );
	const patternIdsByCategory = {
		first: patterns.map( ( { ID } ) => `${ ID }` ) ?? [],
	};

	return (
		<BlockRendererProvider
			siteId={ RENDERER_SITE_ID }
			placeholder={ <PatternGalleryServer { ...props } /> }
		>
			<PatternsRendererProvider
				patternIdsByCategory={ patternIdsByCategory }
				shouldShufflePosts={ false }
				siteId={ RENDERER_SITE_ID }
			>
				<div
					className={ classNames( 'pattern-gallery', {
						'pattern-gallery--grid': isGridView,
						'pattern-gallery--pages': patternTypeFilter === PatternTypeFilter.PAGES,
					} ) }
				>
					{ patterns.map( ( pattern, i ) => (
						<PatternPreview
							isResizable={ ! isGridView }
							canCopy={ isLoggedIn || i < LOGGED_OUT_USERS_CAN_COPY_COUNT }
							className={ classNames( {
								'pattern-preview--grid': isGridView,
								'pattern-preview--list': ! isGridView,
								'pattern-preview--page': patternTypeFilter === PatternTypeFilter.PAGES,
							} ) }
							getPatternPermalink={ getPatternPermalink }
							key={ pattern.ID }
							pattern={ pattern }
							viewportWidth={ isGridView ? DESKTOP_VIEWPORT_WIDTH : undefined }
						/>
					) ) }
				</div>
			</PatternsRendererProvider>
		</BlockRendererProvider>
	);
};
