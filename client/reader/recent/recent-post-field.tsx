import { useTranslate } from 'i18n-calypso';
import { forwardRef } from 'react';
import ReaderFeaturedImage from 'calypso/blocks/reader-featured-image';
import AutoDirection from 'calypso/components/auto-direction';
import type { PostItem } from './types';

interface RecentPostFieldProps {
	post: PostItem;
}

const RecentPostField = forwardRef< HTMLDivElement, RecentPostFieldProps >( ( { post }, ref ) => {
	const translate = useTranslate();

	if ( ! post ) {
		return null;
	}

	const title = post?.title?.trim() ? post.title : `(${ translate( 'no title' ) })`;

	return (
		<div className="recent-post-field" ref={ ref } role="button" tabIndex={ 0 }>
			<AutoDirection>
				<div className="recent-post-field__title">
					<div
						className={ `recent-post-field__title-text${
							! post?.title?.trim() ? ' is-untitled' : ''
						}` }
					>
						{ title }
					</div>
					<div className="recent-post-field__site-name">{ post?.site_name }</div>
				</div>
			</AutoDirection>

			<div className="recent-post-field__featured-image">
				<ReaderFeaturedImage
					imageUrl={ post?.featured_image }
					imageWidth={ 38 }
					imageHeight={ 38 }
					isCompactPost
				/>
			</div>
		</div>
	);
} );

RecentPostField.displayName = 'RecentPostField';

export default RecentPostField;
