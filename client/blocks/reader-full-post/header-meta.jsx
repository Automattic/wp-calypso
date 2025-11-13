import { TimeSince } from '@automattic/components';
import PropTypes from 'prop-types';
import ReaderAuthorLink from 'calypso/blocks/reader-author-link';
import ReaderAvatar from 'calypso/blocks/reader-avatar';
import ReaderSiteStreamLink from 'calypso/blocks/reader-site-stream-link';
import { areEqualIgnoringWhitespaceAndCase } from 'calypso/lib/string';
import ReaderFollowButton from 'calypso/reader/follow-button';
import { getStreamUrl } from 'calypso/reader/route';
import { recordPermalinkClick } from 'calypso/reader/stats';

const ReaderFullPostHeaderMeta = ( {
	post,
	author,
	siteIcon,
	feedIcon,
	siteName,
	siteUrl,
	feedUrl,
	feedId,
	siteId,
	onFollowToggle,
} ) => {
	const recordDateClick = () => {
		recordPermalinkClick( 'timestamp_full_post', post );
	};

	const streamUrl = getStreamUrl( feedId, siteId );
	const followUrl = feedUrl || siteUrl;

	const hasAuthorName = author?.name;
	const hasMatchingAuthorAndSiteNames =
		hasAuthorName &&
		areEqualIgnoringWhitespaceAndCase( String( siteName ), String( author?.name ) );
	const showAuthorLink = hasAuthorName && ! hasMatchingAuthorAndSiteNames;

	return (
		<div className="reader-full-post__header-meta-wrapper">
			<ReaderAvatar
				author={ author }
				siteIcon={ siteIcon }
				feedIcon={ feedIcon }
				siteUrl={ streamUrl }
				iconSize={ 36 }
				className="reader-full-post__header-meta-avatars"
			/>
			<div className="reader-full-post__header-meta-info">
				<div className="reader-full-post__header-meta-line-1">
					{ showAuthorLink && (
						<>
							<ReaderAuthorLink
								className="reader-full-post__header-meta-author"
								author={ author }
								siteUrl={ streamUrl }
								post={ post }
							>
								{ author.name }
							</ReaderAuthorLink>
							<span className="reader-full-post__header-meta-separator"> • </span>
						</>
					) }
					{ siteName && (
						<ReaderSiteStreamLink
							className="reader-full-post__header-meta-site-link"
							feedId={ feedId }
							siteId={ siteId }
							post={ post }
						>
							{ siteName }
						</ReaderSiteStreamLink>
					) }
				</div>
				<div className="reader-full-post__header-meta-line-2">
					{ post.date && (
						<>
							<span className="reader-full-post__header-meta-date">
								<a
									className="reader-full-post__header-meta-date-link"
									onClick={ recordDateClick }
									href={ post.URL }
									target="_blank"
									rel="noopener noreferrer"
								>
									<TimeSince date={ post.date } />
								</a>
							</span>
							<span className="reader-full-post__header-meta-separator"> • </span>
						</>
					) }
					{ followUrl && (
						<ReaderFollowButton
							siteUrl={ followUrl }
							onFollowToggle={ onFollowToggle }
							railcar={ post?.railcar }
							className="reader-full-post__header-meta-follow"
						/>
					) }
				</div>
			</div>
		</div>
	);
};

ReaderFullPostHeaderMeta.propTypes = {
	post: PropTypes.object.isRequired,
	author: PropTypes.object,
	siteIcon: PropTypes.string,
	feedIcon: PropTypes.string,
	siteName: PropTypes.string,
	siteUrl: PropTypes.string,
	feedUrl: PropTypes.string,
	feedId: PropTypes.number,
	siteId: PropTypes.number,
	onFollowToggle: PropTypes.func,
};

export default ReaderFullPostHeaderMeta;
