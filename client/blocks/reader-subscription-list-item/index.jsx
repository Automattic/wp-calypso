import classnames from 'classnames';
import { localize } from 'i18n-calypso';
import { flowRight as compose, isEmpty, get } from 'lodash';
import { connect } from 'react-redux';
import ReaderAvatar from 'calypso/blocks/reader-avatar';
import ReaderSiteNotificationSettings from 'calypso/blocks/reader-site-notification-settings';
import ReaderSubscriptionListItemPlaceholder from 'calypso/blocks/reader-subscription-list-item/placeholder';
import ExternalLink from 'calypso/components/external-link';
import { withLocalizedMoment } from 'calypso/components/localized-moment';
import FollowButton from 'calypso/reader/follow-button';
import {
	getSiteName,
	getSiteDescription,
	getSiteAuthorName,
	getFeedUrl,
	getSiteUrl,
} from 'calypso/reader/get-helpers';
import { formatUrlForDisplay } from 'calypso/reader/lib/feed-display-helper';
import { getStreamUrl } from 'calypso/reader/route';
import { recordTrack, recordTrackWithRailcar } from 'calypso/reader/stats';
import { getFeed } from 'calypso/state/reader/feeds/selectors';
import { getReaderFollowForFeed } from 'calypso/state/reader/follows/selectors';

import './style.scss';

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
	const feedIcon = feed ? feed.site_icon ?? get( feed, 'image' ) : null;
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
					<a
						href={ streamUrl }
						className="reader-subscription-list-item__link"
						onClick={ recordTitleClick }
					>
						{ siteTitle }
					</a>
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
						{ feed && feed.date_subscribed && (
							<span className="reader-subscription-list-item__date-subscribed">
								{ translate( 'followed %s', {
									args: moment( feed.date_subscribed ).format( 'MMM YYYY' ),
								} ) }
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

export default compose(
	connect( ( state, ownProps ) => {
		const feed = getFeed( state, ownProps.feedId );

		if ( feed ) {
			const follow = getReaderFollowForFeed( state, parseInt( ownProps.feedId ) );
			// Add site icon to feed object so have icon for external feeds
			feed.site_icon = follow?.site_icon;
			// Add date_subscribed timestamp to feed object
			feed.date_subscribed = follow?.date_subscribed;
		}

		return {
			feed,
		};
	} ),
	localize,
	withLocalizedMoment
)( ReaderSubscriptionListItem );
