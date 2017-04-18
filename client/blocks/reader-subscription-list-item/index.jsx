/**
 * External Dependencies
 */
import React from 'react';
import classnames from 'classnames';
import { trim, isEmpty, get } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal Dependencies
 */
import ReaderAvatar from 'blocks/reader-avatar';
import FollowButton from 'reader/follow-button';
import { getStreamUrl } from 'reader/route';
import EmailSettings from './email-settings';

function ReaderSubscriptionListItem( {
	url,
	feedId,
	feed,
	siteId,
	site,
	className = '',
	translate,
	followSource,
} ) {
	const siteTitle = ( site && site.title ) || ( feed && feed.name );
	const siteAuthor = site && site.owner;
	const siteExcerpt = ( site && site.description ) || ( feed && feed.description );
	// prefer a users name property
	// if that doesn't exist settle for combining first and last name
	const authorName = siteAuthor && ( siteAuthor.name ||
		trim( `${ siteAuthor.first_name || '' } ${ siteAuthor.last_name || '' }` ) );
	const siteIcon = get( site, 'icon.img' );
	const feedIcon = get( feed, 'image' );
	const streamUrl = getStreamUrl( feedId, siteId );
	const siteUrl = url ||
		( site && site.URL ) ||
		( feed && ( feed.feed_URL || feed.URL ) );
	const isFollowing = ( site && site.is_following ) || ( feed && feed.is_following );

	return (
		<div className={ classnames( 'reader-subscription-list-item', className ) }>
			<div>
				<ReaderAvatar
					siteIcon={ siteIcon }
					feedIcon={ feedIcon }
					author={ siteAuthor }
					preferGravatar={ true }
					siteUrl={ streamUrl }
					isCompact={ true }
				/>
			</div>
			<div className="reader-subscription-list-item__byline">
				<span className="reader-subscription-list-item__site-title">
					{ <a href={ streamUrl } className="reader-subscription-list-item__link"> { siteTitle } </a> }
				</span>
				<div className="reader-subscription-list-item__site-excerpt">{ siteExcerpt }</div>
				{ ! isEmpty( authorName ) &&
					<span className="reader-subscription-list-item__by-text">
						{
							translate( 'by {{author/}}', {
								components: {
									author: <a href={ streamUrl } className="reader-subscription-list-item__link"> { authorName } </a>
								}
							} )
						}
					</span>
				}
			</div>
			<div className="reader-subscription-list-item__options">
				<FollowButton siteUrl={ siteUrl } followSource={ followSource } />
				{ isFollowing && <EmailSettings /> }
			</div>
		</div>
	);
}

export default localize( ReaderSubscriptionListItem );
