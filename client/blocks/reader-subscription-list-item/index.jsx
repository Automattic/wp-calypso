/**
 * External Dependencies
 */
import React from 'react';
import classnames from 'classnames';
import { isEmpty, get } from 'lodash';
import { localize } from 'i18n-calypso';
import moment from 'moment';

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
import ReaderSubscriptionListItemPlaceholder
	from 'blocks/reader-subscription-list-item/placeholder';

/**
 * Takes in a string and removes the starting https, www., and removes a trailing slash
 *
 * @param {String} url - the url to format
 * @returns {String} - the formatted url.  e.g. "https://www.wordpress.com/" --> "wordpress.com"
 */
const formatUrlForDisplay = url => untrailingslashit( url.replace( /^https?:\/\/(www\.)?/, '' ) );

function ReaderSubscriptionListItem( {
	url,
	feedId,
	feed,
	siteId,
	site,
	className = '',
	translate,
	followSource,
	showEmailSettings,
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
	const isMultiAuthor = get( site, 'is_multi_author', false );
	const preferGravatar = ! isMultiAuthor;
	const lastUpdatedDate = moment( get( feed, 'last_update' ) ).fromNow();

	if ( ! site && ! feed ) {
		return <ReaderSubscriptionListItemPlaceholder />;
	}

	return (
		<div className={ classnames( 'reader-subscription-list-item', className ) }>
			<div>
				<ReaderAvatar
					siteIcon={ siteIcon }
					feedIcon={ feedIcon }
					author={ siteAuthor }
					preferBlavatar={ isMultiAuthor }
					preferGravatar={ preferGravatar }
					siteUrl={ streamUrl }
					isCompact={ true }
				/>
			</div>
			<div className="reader-subscription-list-item__byline">
				<span className="reader-subscription-list-item__site-title">
					{
						<a href={ streamUrl } className="reader-subscription-list-item__link">
							{ ' ' }{ siteTitle }{ ' ' }
						</a>
					}
				</span>
				<div className="reader-subscription-list-item__site-excerpt">{ siteExcerpt }</div>
				{ ! isMultiAuthor &&
					! isEmpty( authorName ) &&
					<span className="reader-subscription-list-item__by-text">
						{ translate( 'by {{author/}}', {
							components: {
								author: (
									<a href={ streamUrl } className="reader-subscription-list-item__link">
										{ ' ' }{ authorName }{ ' ' }
									</a>
								),
							},
						} ) }
					</span> }
				{ siteUrl &&
					<a
						href={ siteUrl }
						target="_blank"
						rel="noopener noreferrer"
						className="reader-subscription-list-item__site-url"
					>
						{ formatUrlForDisplay( siteUrl ) }
						{ feed && feed.last_update && translate( ' updated %s ', { args: lastUpdatedDate } ) }
					</a> }
			</div>
			<div className="reader-subscription-list-item__options">
				<FollowButton
					siteUrl={ feedUrl }
					followSource={ followSource }
					feedId={ feedId }
					siteId={ siteId }
				/>
				{ isFollowing && showEmailSettings && <EmailSettings siteId={ siteId } /> }
			</div>
		</div>
	);
}

export default localize( ReaderSubscriptionListItem );
