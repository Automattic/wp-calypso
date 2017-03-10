/**
 * External Dependencies
 */
import React from 'react';
import { get, map, compact } from 'lodash';
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
import Gridicon from 'gridicons';
import {
	recordAction,
	recordGaEvent,
	recordTrackForPost,
} from 'reader/stats';

function recordTagClick( tag ) {
	recordAction( 'click_tag' );
	recordGaEvent( 'Clicked Tag Link' );
	recordTrackForPost( 'calypso_reader_tag_clicked', this.props.post, { tag } );
}

const ReaderCombinedCard = ( { posts, site, feed, onClick, isDiscover, translate } ) => {
	const feedId = get( feed, 'feed_ID' );
	const siteId = get( site, 'ID' );
	const siteIcon = get( site, 'icon.img' );
	const feedIcon = get( feed, 'image' );
	const streamUrl = getStreamUrl( feedId, siteId );
	const siteName = siteNameFromSiteAndPost( site, posts[ 0 ] );
	const primaryTags = compact( map(
		posts,
		post => post.primary_tag
	) );

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
					<div style={ { display: 'flex' } }>
						<p className="reader-combined-card__header-post-count">
							{ translate( '%(count)d posts', {
								args: {
									count: posts.length
								}
							} ) }
						</p>
						{ map( primaryTags, tag => (
							<span className="reader-post-card__tag">
								<Gridicon icon="tag" />
								<a href={ '/tag/' + tag.slug }
									className="reader-post-card__tag-link ignore-click"
									onClick={ tag => recordTagClick( tag ) }>
									{ tag.name }
								</a>
							</span>
						) ) }
					</div>

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
