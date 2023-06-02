import { get } from 'lodash';
import PropTypes from 'prop-types';
import ReaderExcerpt from 'calypso/blocks/reader-excerpt';
import AutoDirection from 'calypso/components/auto-direction';
import TimeSince from 'calypso/components/time-since';
import { recordPermalinkClick } from 'calypso/reader/stats';
import FeaturedAsset from './featured-asset';

const TagPost = ( { post, isDiscover, expandCard, postKey, isExpanded, site } ) => {
	const onVideoThumbnailClick =
		post.canonical_media?.mediaType === 'video'
			? () => expandCard( { postKey, post, site } )
			: null;

	const siteSlug = get( site, 'slug' );
	const siteUrl = get( site, 'URL' );

	const recordDateClick = () => {
		recordPermalinkClick( 'timestamp_card', this.props.post );
	};

	const recordStubClick = () => {
		recordPermalinkClick( 'stub_url_card', this.props.post );
	};

	return (
		<div className="reader-post-card__post">
			<div className="reader-post-card__post-details">
				<AutoDirection>
					<h2 className="reader-post-card__title">
						<a className="reader-post-card__title-link" href={ post.URL }>
							{ post.title }
						</a>
					</h2>
				</AutoDirection>
				<ReaderExcerpt post={ post } isDiscover={ isDiscover } />
				<div className="reader-post-card__byline-details">
					<div className="reader-post-card__timestamp-and-tag">
						{ post.date && post.URL && (
							<span className="reader-post-card__timestamp">
								<a
									className="reader-post-card__timestamp-slug"
									onClick={ recordStubClick }
									href={ siteUrl }
									target="_blank"
									rel="noopener noreferrer"
								>
									{ siteSlug }
								</a>
								<span className="reader-post-card__timestamp-bullet">·</span>
								<a
									className="reader-post-card__timestamp-link"
									onClick={ recordDateClick }
									href={ post.URL }
									target="_blank"
									rel="noopener noreferrer"
								>
									<TimeSince date={ post.date } />
								</a>
							</span>
						) }
					</div>
				</div>
			</div>
			<FeaturedAsset
				post={ post }
				canonicalMedia={ post.canonical_media }
				postUrl={ post.URL }
				onVideoThumbnailClick={ onVideoThumbnailClick }
				isVideoExpanded={ isExpanded }
				isTagPost={ true }
			/>
		</div>
	);
};

TagPost.propTypes = {
	post: PropTypes.object.isRequired,
	isDiscover: PropTypes.bool,
};

export default TagPost;
