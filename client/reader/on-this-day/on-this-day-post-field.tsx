import { forwardRef } from 'react';
import ReaderFeaturedImage from 'calypso/blocks/reader-featured-image';
import AutoDirection from 'calypso/components/auto-direction';
import { getPostTitleFallback } from 'calypso/reader/utils';

interface OnThisDayPostFieldProps {
	post: {
		title?: string;
		excerpt?: string;
		content?: string;
		featured_image?: string;
		site_name?: string;
		date?: string;
	};
	onClick?: () => void;
	onKeyDown?: ( event: React.KeyboardEvent< HTMLDivElement > ) => void;
}

export const OnThisDayPostField = forwardRef< HTMLDivElement, OnThisDayPostFieldProps >(
	( { post, onClick, onKeyDown }, ref ) => {
		if ( ! post ) {
			return null;
		}

		const year = post.date ? new Date( post.date ).getFullYear() : null;

		return (
			<div
				className="on-this-day-post-field"
				ref={ ref }
				role="button"
				tabIndex={ 0 }
				onClick={ onClick }
				onKeyDown={ onKeyDown }
			>
				<AutoDirection>
					<div className="on-this-day-post-field__title">
						<div className="on-this-day-post-field__title-text">
							{ post?.title ||
								getPostTitleFallback( {
									title: post?.title ?? '',
									excerpt: post?.excerpt ?? '',
									content: post?.content ?? '',
								} ) }
						</div>
						<div className="on-this-day-post-field__meta">
							<span className="on-this-day-post-field__site-name">{ post?.site_name }</span>
							{ year && <span className="on-this-day-post-field__year">{ year }</span> }
						</div>
					</div>
				</AutoDirection>

				<div className="on-this-day-post-field__featured-image">
					<ReaderFeaturedImage
						imageUrl={ post?.featured_image }
						imageWidth={ 38 }
						imageHeight={ 38 }
						isCompactPost
					/>
				</div>
			</div>
		);
	}
);

OnThisDayPostField.displayName = 'OnThisDayPostField';
