/**
 * External Dependencies
 */
import React from 'react';
import { get } from 'lodash';

/**
 * Internal Dependencies
 */
import { getStreamUrl } from 'reader/route';
import ReaderAvatar from 'blocks/reader-avatar';
import ReaderSiteStreamLink from 'blocks/reader-site-stream-link';
import { siteNameFromSiteAndPost } from 'reader/utils';
import ReaderCombinedCardPost from './post';

const ReaderCombinedCard = ( { posts, site, feed } ) => {
	const feedId = get( feed, 'ID' );
	const siteId = get( site, 'ID' );
	const siteIcon = get( site, 'icon.img' );
	const feedIcon = get( feed, 'image' );
	const streamUrl = getStreamUrl( feedId, siteId );
	const siteName = siteNameFromSiteAndPost( site, posts[ 0 ] );

	return (
		<div className="reader-combined-card">
			<header className="reader-combined-card__header">
				<ReaderAvatar
					siteIcon={ siteIcon }
					feedIcon={ feedIcon }
					author={ null }
					preferGravatar={ true }
					siteUrl={ streamUrl } />
				<ReaderSiteStreamLink
					className="reader-combined-card__site-link"
					feedId={ feedId }
					siteId={ siteId }>
					{ siteName }
				</ReaderSiteStreamLink>
				<p>{ posts.length } posts in timespan</p>
			</header>
			<ul>
				{ posts.map( post => (
					<ReaderCombinedCardPost key={ `post-${ post.ID }` } post={ post } />
				) ) }
			</ul>
		</div>
	);
};

ReaderCombinedCard.propTypes = {
	posts: React.PropTypes.array.isRequired,
	site: React.PropTypes.object,
	feed: React.PropTypes.object,
};

export default ReaderCombinedCard;
