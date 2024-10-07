import clsx from 'clsx';
import BlueskyPostActions from './post/actions';
import BlueskyPostBody from './post/body';
import BlueskyPostCard from './post/card';
import BlueskyPostHeader from './post/header';
import { BlueskyPostSidebar } from './post/sidebar';
import type { BlueskyPreviewProps } from './types';

import './styles.scss';

export const BlueskyPostPreview: React.FC< BlueskyPreviewProps > = ( props ) => {
	const { user, media } = props;

	return (
		<div className="bluesky-preview__post">
			<BlueskyPostSidebar user={ user } />
			<div>
				<BlueskyPostHeader user={ user } />
				<BlueskyPostBody { ...props }>
					{ media?.length ? (
						<div className={ clsx( 'bluesky-preview__media', { 'as-grid': media.length > 1 } ) }>
							{ media.map( ( mediaItem, index ) => (
								<div
									key={ `bluesky-preview__media-item-${ index }` }
									className="bluesky-preview__media-item"
								>
									{ mediaItem.type.startsWith( 'video/' ) ? (
										// eslint-disable-next-line jsx-a11y/media-has-caption
										<video controls>
											<source src={ mediaItem.url } type={ mediaItem.type } />
										</video>
									) : (
										<img alt={ mediaItem.alt || '' } src={ mediaItem.url } />
									) }
								</div>
							) ) }
						</div>
					) : null }
				</BlueskyPostBody>
				{ ! media?.length ? <BlueskyPostCard { ...props } /> : null }
				<BlueskyPostActions />
			</div>
		</div>
	);
};
