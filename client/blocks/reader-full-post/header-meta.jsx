import { TimeSince } from '@automattic/components';
import PropTypes from 'prop-types';
import ReaderAuthorLink from 'calypso/blocks/reader-author-link';
import ReaderAvatar from 'calypso/blocks/reader-avatar';
import ReaderSiteStreamLink from 'calypso/blocks/reader-site-stream-link';
import { areEqualIgnoringWhitespaceAndCase } from 'calypso/lib/string';
import { getStreamUrl } from 'calypso/reader/route';

const ReaderFullPostHeaderMeta = ( { post, author, siteName, feedId, siteId } ) => {
	const streamUrl = getStreamUrl( feedId, siteId );

	const hasAuthorName = author?.name;
	const hasMatchingAuthorAndSiteNames =
		hasAuthorName &&
		areEqualIgnoringWhitespaceAndCase( String( siteName ), String( author?.name ) );
	const showAuthorLink = hasAuthorName && ! hasMatchingAuthorAndSiteNames;

	return (
		<div className="reader-full-post__header-meta-wrapper">
			<ReaderAvatar
				author={ author }
				siteUrl={ streamUrl }
				iconSize={ 40 }
				preferGravatar
				className="reader-full-post__header-meta-avatars"
			/>
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
