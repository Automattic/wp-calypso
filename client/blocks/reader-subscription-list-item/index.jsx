/** @format */
/**
 * External dependencies
 */
import classnames from 'classnames';
import { localize } from 'i18n-calypso';
import { isEmpty, get } from 'lodash';
import moment from 'moment';
import React from 'react';

/**
 * Internal dependencies
 */
import ReaderAvatar from 'blocks/reader-avatar';
import EmailSettings from 'blocks/reader-email-settings';
import ReaderSubscriptionListItemPlaceholder from 'blocks/reader-subscription-list-item/placeholder';
import untrailingslashit from 'lib/route/untrailingslashit';
import FollowButton from 'reader/follow-button';
import { getSiteName, getSiteDescription, getSiteAuthorName, getFeedUrl, getSiteUrl } from 'reader/get-helpers';
import { getStreamUrl } from 'reader/route';
import { recordTrack, recordTrackWithRailcar } from 'reader/stats';

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
	const lastUpdatedDate = showLastUpdatedDate && moment( get( feed, 'last_update' ) ).fromNow();

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
		<div
			className={ classnames( 'reader-subscription-list-item', className, {
				'has-email-settings': showEmailSettings && isFollowing,
			} ) }
		>
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
				{ ! isMultiAuthor &&
				! isEmpty( authorName ) && (
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
						<a
							href={ siteUrl }
							target="_blank"
							rel="noopener noreferrer"
							className="reader-subscription-list-item__site-url"
							onClick={ recordSiteUrlClick }
						>
							{ formatUrlForDisplay( siteUrl ) }
						</a>
						{ showLastUpdatedDate && (
							<span className="reader-subscription-list-item__timestamp">
								{ feed && feed.last_update && translate( 'updated %s', { args: lastUpdatedDate } ) }
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
				{ isFollowing && showEmailSettings && <EmailSettings siteId={ siteId } /> }
			</div>
		</div>
	);
}

export default localize( ReaderSubscriptionListItem );
