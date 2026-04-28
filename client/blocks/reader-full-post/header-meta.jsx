import { TimeSince } from '@automattic/components';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import ReaderAuthorLink from 'calypso/blocks/reader-author-link';
import ReaderSiteStreamLink from 'calypso/blocks/reader-site-stream-link';
import UserAvatar from 'calypso/blocks/user-avatar';
import { areEqualIgnoringWhitespaceAndCase } from 'calypso/lib/string';
import { AuthorAchievementBadges } from 'calypso/reader/components/achievements/author-achievement-badges';
import { getStreamUrl } from 'calypso/reader/route';
import { getFeed } from 'calypso/state/reader/feeds/selectors';

const ReaderFullPostHeaderMeta = ( { post, author, siteName, feedId, siteId } ) => {
	const streamUrl = getStreamUrl( feedId, siteId );
	const feed = useSelector( ( state ) => getFeed( state, feedId ) );
	const hasAuthorName = author?.name;
	const hasMatchingAuthorAndSiteNames =
		hasAuthorName &&
		areEqualIgnoringWhitespaceAndCase( String( siteName ), String( author?.name ) );
	const showAuthorLink = hasAuthorName && ! hasMatchingAuthorAndSiteNames;
	const avatarUrl =
		! author?.avatar_URL && post.is_external ? feed?.site_icon || feed?.image : author?.avatar_URL;
	return (
		<div className="reader-full-post__header-meta-wrapper">
			<UserAvatar user={ { ...author, avatar_URL: avatarUrl } } size={ 40 } />
			<div className="reader-full-post__header-meta-info">
				<div className="reader-full-post__header-meta-line-1">
					{ showAuthorLink && (
						<ReaderAuthorLink
							className="reader-full-post__header-meta-author"
							author={ author }
							siteUrl={ streamUrl }
							post={ post }
						>
							{ author.name }
						</ReaderAuthorLink>
					) }
					{ showAuthorLink && (
						<AuthorAchievementBadges authorLogin={ author?.wpcom_login } size="small" />
					) }
					{ showAuthorLink && post.date && (
						<span className="reader-full-post__header-meta-separator"> • </span>
					) }
					{ post.date && (
						<span className="reader-full-post__header-meta-date">
							<span className="reader-full-post__header-meta-date-text">
								<TimeSince date={ post.date } />
							</span>
						</span>
					) }
				</div>
				<div className="reader-full-post__header-meta-line-2">
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
			</div>
		</div>
	);
};

ReaderFullPostHeaderMeta.propTypes = {
	post: PropTypes.object.isRequired,
	author: PropTypes.object,
	siteName: PropTypes.string,
	feedId: PropTypes.number,
	siteId: PropTypes.number,
};

export default ReaderFullPostHeaderMeta;
