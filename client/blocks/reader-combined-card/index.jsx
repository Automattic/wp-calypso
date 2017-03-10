/**
 * External Dependencies
 */
import React from 'react';
import { get, isEmpty, first, last } from 'lodash';
import { localize } from 'i18n-calypso';
import moment from 'moment';

/**
 * Internal Dependencies
 */
import Card from 'components/card';
import { getStreamUrl } from 'reader/route';
import ReaderAvatar from 'blocks/reader-avatar';
import ReaderSiteStreamLink from 'blocks/reader-site-stream-link';
import { siteNameFromSiteAndPost } from 'reader/utils';
import ReaderCombinedCardPost from './post';

const ReaderCombinedCard = ( { posts, site, feed, onClick, isDiscover, translate } ) => {
	if ( isEmpty( posts ) ) {
		return null;
	}

	const feedId = get( feed, 'feed_ID' );
	const siteId = get( site, 'ID' );
	const siteIcon = get( site, 'icon.img' );
	const feedIcon = get( feed, 'image' );
	const streamUrl = getStreamUrl( feedId, siteId );
	const siteName = siteNameFromSiteAndPost( site, posts[ 0 ] );
	const duration = getHumanizedDuration( first( posts ).date, last( posts ).date );

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
						{ translate( '%(count)d posts in %(duration)s', {
							args: {
								count: posts.length,
								duration,
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
						onClick={ onClick }
						isDiscover={ isDiscover }
						/>
				) ) }
			</ul>
		</Card>
	);
};

function getHumanizedDuration( startDate, endDate ) {
	const start = moment( startDate );
	const end = moment( endDate );
	return moment.duration( start.diff( end ) ).humanize();
}

ReaderCombinedCard.propTypes = {
	posts: React.PropTypes.array.isRequired,
	site: React.PropTypes.object,
	feed: React.PropTypes.object,
	onClick: React.PropTypes.func,
	isDiscover: React.PropTypes.bool,
};

ReaderCombinedCard.defaultProps = {
	isDiscover: false,
};

export default localize( ReaderCombinedCard );
