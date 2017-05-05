/**
 * External Dependencies
 */
import React from 'react';
import classnames from 'classnames';
import { isEmpty, get } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal Dependencies
 */
import ReaderAvatar from 'blocks/reader-avatar';
import FollowButton from 'reader/follow-button';
import { getStreamUrl } from 'reader/route';
import EmailSettings from './email-settings';
import {
	getSiteName,
	getSiteDescription,
	getSiteAuthorName,
	getFeedUrl,
	getSiteUrl,
} from 'reader/get-helpers';
import untrailingslashit from 'lib/route/untrailingslashit';

// Remove the starting https, www. and remove trailing slash.
const stripUrl = url => untrailingslashit(
	url.replace( /^https?:\/\/(www\.)?/, '' )
);

function ReaderSubscriptionListItem( {
	url,
	feedId,
	feed,
	siteId,
	site,
	className = '',
	translate,
	followSource,
	isEmailBlocked,
} ) {
	const siteTitle = getSiteName( { feed, site } );
	const siteAuthor = site && site.owner;
	const siteExcerpt = getSiteDescription( { feed, site } );
	const authorName = getSiteAuthorName( site );
	const siteIcon = get( site, 'icon.img' );
	const feedIcon = get( feed, 'image' );
	const streamUrl = getStreamUrl( feedId, siteId );
	const feedUrl = url || getFeedUrl( { feed, site } );
	const siteUrl = getSiteUrl( { feed, site } );
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
			{ siteUrl && (
				<a
					href={ siteUrl }
					target="_blank"
					rel="noopener noreferrer"
					className="reader-subscription-list-item__site-url"
				>
					{ stripUrl( siteUrl ) }
				</a>
			) }
			</div>
			<div className="reader-subscription-list-item__options">
				<FollowButton siteUrl={ feedUrl } followSource={ followSource } />
				{ isFollowing && ! isEmailBlocked && <EmailSettings siteId={ siteId } /> }
			</div>
		</div>
	);
}

export default localize( ReaderSubscriptionListItem );
