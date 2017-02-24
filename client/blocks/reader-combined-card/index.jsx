/**
 * External Dependencies
 */
import React from 'react';
import { get } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal Dependencies
 */
import Card from 'components/card';
import { getStreamUrl } from 'reader/route';
import ReaderAvatar from 'blocks/reader-avatar';
import ReaderSiteStreamLink from 'blocks/reader-site-stream-link';
import { siteNameFromSiteAndPost } from 'reader/utils';
import ReaderCombinedCardPost from './post';

const ReaderCombinedCard = ( { posts, site, feed, onClickPost, translate } ) => {
	const feedId = get( feed, 'ID' );
	const siteId = get( site, 'ID' );
	const siteIcon = get( site, 'icon.img' );
	const feedIcon = get( feed, 'image' );
	const streamUrl = getStreamUrl( feedId, siteId );
	const siteName = siteNameFromSiteAndPost( site, posts[ 0 ] );

	return (
		<Card className="reader-combined-card">
			<header className="reader-combined-card__header">
				<ReaderAvatar
					siteIcon={ siteIcon }
					feedIcon={ feedIcon }
					author={ null }
					preferGravatar={ true }
					siteUrl={ streamUrl }
					siteIconSize={ 32 } />
				<div className="reader-combined-card__header-details">
					<ReaderSiteStreamLink
						className="reader-combined-card__site-link"
						feedId={ feedId }
						siteId={ siteId }>
						{ siteName }
					</ReaderSiteStreamLink>
					<p className="reader-combined-card__header-post-count">
						{ translate( '%(count)d posts', {
							args: {
								count: posts.length
							}
						} ) }
					</p>
				</div>
			</header>
			<ul className="reader-combined-card__post-list">
				{ posts.map( post => (
					<ReaderCombinedCardPost
						key={ `post-${ post.ID }` }
						post={ post }
						streamUrl={ streamUrl }
						onClick={ onClickPost } />
				) ) }
			</ul>
		</Card>
	);
};

ReaderCombinedCard.propTypes = {
	posts: React.PropTypes.array.isRequired,
	site: React.PropTypes.object,
	feed: React.PropTypes.object,
	onClickPost: React.PropTypes.func,
};

export default localize( ReaderCombinedCard );
