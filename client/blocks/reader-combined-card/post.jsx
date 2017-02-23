/**
 * External Dependencies
 */
import React from 'react';
import { has } from 'lodash';

/**
 * Internal Dependencies
 */
import AutoDirection from 'components/auto-direction';
import ReaderExcerpt from 'blocks/reader-excerpt';
import ReaderVisitLink from 'blocks/reader-visit-link';
import ReaderAuthorLink from 'blocks/reader-author-link';
import { recordPermalinkClick } from 'reader/stats';
import PostTime from 'reader/post-time';
import ReaderFeaturedImage from 'blocks/reader-featured-image';

const ReaderCombinedCardPost = ( { post, streamUrl /*, site, feed*/ } ) => {
	const hasAuthorName = has( post, 'author.name' );
	let featuredAsset = null;
	if ( post.canonical_media ) {
		featuredAsset = <ReaderFeaturedImage imageUrl={ post.canonical_media.src } href={ post.URL } />;
	}
	const recordDateClick = () => {
		recordPermalinkClick( 'timestamp_combined_card', post );
	};

	return (
		<li className="reader-combined-card__post">
			{ featuredAsset }
			<div className="reader-combined-card__post-details">
				<AutoDirection>
					<h1 className="reader-combined-card__post-title">
						<a className="reader-combined-card__post-title-link" href={ post.URL }>{ post.title }</a>
					</h1>
				</AutoDirection>
				<ReaderExcerpt post={ post } isDiscover={ false } />
				<div className="reader-combined-card__post-author-and-time">
					<ReaderVisitLink visitUrl={ post.URL } iconSize={ 12 } />
					{ hasAuthorName &&
						<ReaderAuthorLink
							className="reader-combined-card__author-link"
							author={ post.author }
							siteUrl={ streamUrl }
							post={ post }>
							{ post.author.name }
						</ReaderAuthorLink>
					}
					{ post.date && post.URL &&
						<span className="reader-combined-card__timestamp">
							<a className="reader-combined-card__timestamp-link"
								onClick={ recordDateClick }
								href={ post.URL }
								target="_blank"
								rel="noopener noreferrer">
								<PostTime date={ post.date } />
							</a>
						</span>
					}
				</div>
			</div>
		</li>
	);
};

ReaderCombinedCardPost.propTypes = {
	post: React.PropTypes.object.isRequired,
	streamUrl: React.PropTypes.string,
	site: React.PropTypes.object,
	feed: React.PropTypes.object,
};

export default ReaderCombinedCardPost;
