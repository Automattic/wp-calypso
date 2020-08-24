/**
 * External Dependencies
 */
import React from 'react';
import classnames from 'classnames';
import { flowRight as compose, isEmpty, get } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal Dependencies
 */
import ReaderAvatar from 'blocks/reader-avatar';
import FollowButton from 'reader/follow-button';
import { getStreamUrl } from 'reader/route';
import ReaderSiteNotificationSettings from 'blocks/reader-site-notification-settings';
import {
	getSiteName,
	getSiteDescription,
	getSiteAuthorName,
	getFeedUrl,
	getSiteUrl,
} from 'reader/get-helpers';
import { untrailingslashit } from 'lib/route';
import ReaderSubscriptionListItemPlaceholder from 'blocks/reader-subscription-list-item/placeholder';
import { recordTrack, recordTrackWithRailcar } from 'reader/stats';
import ExternalLink from 'components/external-link';
import { withLocalizedMoment } from 'components/localized-moment';

/**
 * Style dependencies
 */
import './style.scss';

/**
 * Takes in a string and removes the starting https, www., and removes a trailing slash
 *
 * @param {string} url - the url to format
 * @returns {string} - the formatted url.  e.g. "https://www.wordpress.com/" --> "wordpress.com"
 */
const formatUrlForDisplay = ( url ) =>
	untrailingslashit( url.replace( /^https?:\/\/(www\.)?/, '' ) );

function ReaderSubscriptionListItem( {
	moment,
	translate,
	url,
	feedId,
	feed,
	siteId,
	site,
	className = '',
	followSource,
	showNotificationSettings,
	showLastUpdatedDate,
	isFollowing,
	railcar,
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
	const isMultiAuthor = get( site, 'is_multi_author', false );
	const preferGravatar = ! isMultiAuthor;

	if ( ! site && ! feed ) {
		return <ReaderSubscriptionListItemPlaceholder />;
	}

	function recordEvent( name ) {
		const props = {
			blog_id: siteId,
			feed_id: feedId,
			source: followSource,
		};
		if ( railcar ) {
			recordTrackWithRailcar( name, railcar, props );
		} else {
			recordTrack( name, props );
		}
	}

	const recordTitleClick = () => recordEvent( 'calypso_reader_feed_link_clicked' );
	const recordAuthorClick = () => recordEvent( 'calypso_reader_author_link_clicked' );
	const recordSiteUrlClick = () => recordEvent( 'calypso_reader_site_url_clicked' );
	const recordAvatarClick = () => recordEvent( 'calypso_reader_avatar_clicked' );

	return (
		<div className={ classnames( 'reader-subscription-list-item', className ) }>
			<div className="reader-subscription-list-item__avatar">
				<ReaderAvatar
					siteIcon={ siteIcon }
					feedIcon={ feedIcon }
					author={ siteAuthor }
					preferBlavatar={ isMultiAuthor }
					preferGravatar={ preferGravatar }
					siteUrl={ streamUrl }
					isCompact={ true }
					onClick={ recordAvatarClick }
				/>
			</div>
			<div className="reader-subscription-list-item__byline">
				<span className="reader-subscription-list-item__site-title">
					{
						<a
							href={ streamUrl }
							className="reader-subscription-list-item__link"
							onClick={ recordTitleClick }
						>
							{ siteTitle }
						</a>
					}
				</span>
				<div className="reader-subscription-list-item__site-excerpt">{ siteExcerpt }</div>
				{ ! isMultiAuthor && ! isEmpty( authorName ) && (
					<span className="reader-subscription-list-item__by-text">
						{ translate( 'by {{author/}}', {
							components: {
								author: (
									<a
										href={ streamUrl }
										className="reader-subscription-list-item__link"
										onClick={ recordAuthorClick }
									>
										{ authorName }
									</a>
								),
							},
						} ) }
					</span>
				) }
				{ siteUrl && (
					<div className="reader-subscription-list-item__site-url-timestamp">
						<ExternalLink
							href={ siteUrl }
							className="reader-subscription-list-item__site-url"
							onClick={ recordSiteUrlClick }
							icon={ true }
							iconSize={ 14 }
						>
							{ formatUrlForDisplay( siteUrl ) }
						</ExternalLink>
						{ showLastUpdatedDate && feed && feed.last_update && (
							<span className="reader-subscription-list-item__timestamp">
								{ translate( 'updated %s', { args: moment( feed.last_update ).fromNow() } ) }
							</span>
						) }
					</div>
				) }
			</div>
			<div className="reader-subscription-list-item__options">
				<FollowButton
					siteUrl={ feedUrl }
					followSource={ followSource }
					feedId={ feedId }
					siteId={ siteId }
					railcar={ railcar }
				/>
				{ isFollowing && showNotificationSettings && (
					<ReaderSiteNotificationSettings siteId={ siteId } />
				) }
			</div>
		</div>
	);
}

export default compose( localize, withLocalizedMoment )( ReaderSubscriptionListItem );
