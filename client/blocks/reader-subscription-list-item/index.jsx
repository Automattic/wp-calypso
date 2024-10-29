import clsx from 'clsx';
import { localize } from 'i18n-calypso';
import { flowRight as compose, isEmpty, get } from 'lodash';
import { useState } from 'react';
import { connect } from 'react-redux';
import ReaderAvatar from 'calypso/blocks/reader-avatar';
import ReaderSiteNotificationSettings from 'calypso/blocks/reader-site-notification-settings';
import ReaderSubscriptionListItemPlaceholder from 'calypso/blocks/reader-subscription-list-item/placeholder';
import ReaderSuggestedFollowsDialog from 'calypso/blocks/reader-suggested-follows/dialog';
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
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { getFeed } from 'calypso/state/reader/feeds/selectors';
import { getReaderFollowForFeed } from 'calypso/state/reader/follows/selectors';
import { registerLastActionRequiresLogin } from 'calypso/state/reader-ui/actions';

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
	showFollowedOnDate,
	isFollowing,
	railcar,
	isLoggedIn,
	registerLastActionRequiresLogin: registerLastActionRequiresLoginProp,
	disableSuggestedFollows,
	onItemClick,
	isSelected,
	onFollowToggle,
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
	const [ isSuggestedFollowsModalOpen, setIsSuggestedFollowsModalOpen ] = useState( false );

	if ( ! site && ! feed ) {
		return <ReaderSubscriptionListItemPlaceholder />;
	}

	const openSuggestedFollowsModal = ( followClicked ) => {
		setIsSuggestedFollowsModalOpen( followClicked );
	};

	const onCloseSuggestedFollowModal = () => {
		setIsSuggestedFollowsModalOpen( false );
	};

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

	const streamClicked = ( event, streamLink ) => {
		recordTitleClick();
		if ( ! isLoggedIn ) {
			event.preventDefault();
			registerLastActionRequiresLoginProp( {
				type: 'sidebar-link',
				redirectTo: streamLink,
			} );
		}
	};

	const avatarClicked = ( event, streamLink ) => {
		recordAvatarClick();
		if ( ! isLoggedIn ) {
			event.preventDefault();
			registerLastActionRequiresLoginProp( {
				type: 'sidebar-link',
				redirectTo: streamLink,
			} );
		}
	};

	const handleClick = () => {
		onItemClick();
	};

	return (
		<div
			className={ clsx( 'reader-subscription-list-item', className, {
				'is-selected': isSelected,
			} ) }
			onClick={ handleClick }
			onKeyDown={ ( e ) => e.key === 'Enter' && handleClick( e ) }
			role="button"
			tabIndex={ 0 }
			aria-pressed={ isSelected }
		>
			<div className="reader-subscription-list-item__avatar">
				<ReaderAvatar
					siteIcon={ siteIcon }
					feedIcon={ feedIcon }
					author={ siteAuthor }
					preferBlavatar={ isMultiAuthor }
					preferGravatar={ preferGravatar }
					siteUrl={ streamUrl }
					isCompact
					onClick={ ( event ) => avatarClicked( event, streamUrl ) }
					iconSize={ 32 }
				/>
			</div>
			<div className="reader-subscription-list-item__byline">
				<span className="reader-subscription-list-item__site-title">
					<a
						href={ streamUrl }
						className="reader-subscription-list-item__link"
						onClick={ ( event ) => streamClicked( event, streamUrl ) }
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
						<ul>
							<li>
								<ExternalLink
									href={ siteUrl }
									className="reader-subscription-list-item__site-url"
									onClick={ recordSiteUrlClick }
									icon
									iconSize={ 14 }
								>
									{ formatUrlForDisplay( siteUrl ) }
								</ExternalLink>
							</li>
							{ showLastUpdatedDate && feed && feed.last_update && ! isNaN( feed.last_update ) && (
								<li>
									<span className="reader-subscription-list-item__timestamp">
										{ translate( 'updated %s', {
											args: moment( feed.last_update ).fromNow(),
											context: 'date feed was last updated',
										} ) }
									</span>
								</li>
							) }
							{ showFollowedOnDate &&
								feed &&
								feed.date_subscribed &&
								! isNaN( feed.date_subscribed ) && (
									<li>
										<span
											className="reader-subscription-list-item__date-subscribed"
											title={ moment( feed.date_subscribed ).format( 'll' ) }
										>
											{ translate( 'followed %s', {
												args: moment( feed.date_subscribed ).format( 'MMM YYYY' ),
												context: 'date feed was followed',
											} ) }
										</span>
									</li>
								) }
						</ul>
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
					onFollowToggle={ disableSuggestedFollows ? onFollowToggle : openSuggestedFollowsModal }
				/>
				{ isFollowing && showNotificationSettings && (
					<ReaderSiteNotificationSettings siteId={ siteId } />
				) }
			</div>
			{ siteId && ! disableSuggestedFollows && (
				<ReaderSuggestedFollowsDialog
					onClose={ onCloseSuggestedFollowModal }
					siteId={ +siteId }
					isVisible={ isSuggestedFollowsModalOpen }
				/>
			) }
		</div>
	);
}

export default compose(
	connect(
		( state, ownProps ) => {
			const feed = getFeed( state, ownProps.feedId );

			if ( feed ) {
				const follow = getReaderFollowForFeed( state, parseInt( ownProps.feedId ) );

				if ( follow ) {
					// Add site icon to feed object so have icon for external feeds when not set
					if ( feed.site_icon === undefined ) {
						feed.site_icon = follow.site_icon;
					}
					// Add date_subscribed timestamp to feed object when not set
					if ( feed.date_subscribed === undefined || isNaN( feed.date_subscribed ) ) {
						feed.date_subscribed = follow.date_subscribed;
					}
					// Add last_update timestamp to feed object when not set
					if ( feed.last_update === undefined || isNaN( feed.last_update ) ) {
						feed.last_update = follow.last_updated;
					}
				}
			}

			return {
				feed,
				isLoggedIn: isUserLoggedIn( state ),
			};
		},
		{ registerLastActionRequiresLogin }
	),
	localize,
	withLocalizedMoment
)( ReaderSubscriptionListItem );
