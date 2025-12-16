import { Gridicon } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useState, useEffect, useMemo } from 'react';
import { useDispatch, shallowEqual } from 'react-redux';
import ReaderSiteNotificationSettings from 'calypso/blocks/reader-site-notification-settings';
import ReaderSuggestedFollowsDialog from 'calypso/blocks/reader-suggested-follows/dialog';
import { useFeedRecommendationsMutation } from 'calypso/data/reader/use-feed-recommendations-mutation';
import ReaderFollowButton from 'calypso/reader/follow-button';
import { getSiteUrl, isEligibleForUnseen } from 'calypso/reader/get-helpers';
import { RecommendButton } from 'calypso/reader/recommend-button';
import { useSelector } from 'calypso/state';
import { getCurrentUserName } from 'calypso/state/current-user/selectors';
import { recordReaderTracksEvent } from 'calypso/state/reader/analytics/actions';
import { getFeed } from 'calypso/state/reader/feeds/selectors';
import {
	getReaderFollowForFeed,
	hasReaderFollowOrganization,
	isFollowing,
} from 'calypso/state/reader/follows/selectors';
import { requestRecommendedBlogsListItems } from 'calypso/state/reader/lists/actions';
import {
	isRequestingUserRecommendedBlogs,
	hasRequestedUserRecommendedBlogs,
} from 'calypso/state/reader/lists/selectors';
import { requestMarkAllAsSeen } from 'calypso/state/reader/seen-posts/actions';
import { getSite } from 'calypso/state/reader/sites/selectors';
import getUserSetting from 'calypso/state/selectors/get-user-setting';
import isFeedWPForTeams from 'calypso/state/selectors/is-feed-wpforteams';
import isSiteWPForTeams from 'calypso/state/selectors/is-site-wpforteams';

export default function ReaderFeedHeaderFollow( props ) {
	const { feed, site, streamKey } = props;
	const translate = useTranslate();
	const dispatch = useDispatch();
	const [ isSuggestedFollowsModalOpen, setIsSuggestedFollowsModalOpen ] = useState( false );
	const siteId = site?.ID;
	const siteUrl = getSiteUrl( { feed, site } );
	const { isRecommended, toggleRecommended } = useFeedRecommendationsMutation( feed?.feed_ID );
	// Get the follow data to use as a fallback for feed URLs
	// This selector is scoped to feed_ID to avoid unnecessary re-renders
	const followForFeed = useSelector(
		( state ) => ( feed?.feed_ID ? getReaderFollowForFeed( state, feed.feed_ID ) : null ),
		shallowEqual
	);
	// Calculate an effective site URL, using follow data as fallback
	// This ensures the follow button can render even when feed/site objects have missing URLs
	// Fallback order:
	// 1. siteUrl: from getSiteUrl() using feed/site objects (safeLink-filtered URLs)
	// 2. feed?.feed_URL: direct access to feed URL (may be undefined if filtered by safeLink)
	// 3. feed?.unsanitized_URL: original unfiltered URL from API (always present for valid feeds)
	// 4. followForFeed?.feed_URL: reliable URL from follow subscription data (only available if user is already following)
	// 5. followForFeed?.URL: alternative URL property from follow subscription (only available if user is already following)
	const effectiveSiteUrl = useMemo( () => {
		// Filter out empty strings and return first truthy value
		const candidates = [
			siteUrl,
			feed?.feed_URL,
			feed?.unsanitized_URL,
			followForFeed?.feed_URL,
			followForFeed?.URL,
		];
		return candidates.find( ( url ) => url && url.trim() !== '' );
	}, [ siteUrl, feed?.feed_URL, feed?.unsanitized_URL, followForFeed?.feed_URL, followForFeed?.URL ] );
	
	// Persist the URL once found to handle navigation scenarios where feed becomes null temporarily
	// This prevents the button from disappearing during back button navigation
	// Initial value matches effectiveSiteUrl (may be undefined on first render, which is fine)
	const [ persistedUrl, setPersistedUrl ] = useState( effectiveSiteUrl );
	useEffect( () => {
		if ( effectiveSiteUrl ) {
			// Only update when we have a valid URL - never clear it
			// This ensures the button stays visible even if feed becomes null during navigation
			setPersistedUrl( effectiveSiteUrl );
		}
	}, [ effectiveSiteUrl ] );
	
	// Use persisted URL as final fallback to ensure button doesn't disappear during navigation
	const finalSiteUrl = effectiveSiteUrl || persistedUrl;
	const owner = useSelector( getCurrentUserName );
	const isRequestingRecommendedBlogs = useSelector( ( state ) =>
		isRequestingUserRecommendedBlogs( state, owner )
	);
	const hasRequestedRecommendedBlogs = useSelector( ( state ) =>
		hasRequestedUserRecommendedBlogs( state, owner )
	);

	useEffect( () => {
		if ( ! hasRequestedRecommendedBlogs && ! isRequestingRecommendedBlogs ) {
			dispatch( requestRecommendedBlogsListItems( owner ) );
		}
	}, [ dispatch, hasRequestedRecommendedBlogs, isRequestingRecommendedBlogs, owner ] );

	const {
		following,
		hasOrganization,
		isEmailBlocked,
		isWPForTeamsItem,
		subscriptionId,
		blogOwner,
	} = useSelector( ( state ) => {
		let _siteId = siteId;
		let _feedId = feed?.feed_ID;
		let _feed = _feedId ? getFeed( state, _feedId ) : undefined;
		let _site = _siteId ? getSite( state, _siteId ) : undefined;

		if ( _feed && ! _siteId ) {
			_siteId = _feed.blog_ID || undefined;
			_site = _siteId ? getSite( state, _feed.blog_ID ) : undefined;
		}

		if ( _site && ! _feedId ) {
			_feedId = _site.feed_ID;
			_feed = _feedId ? getFeed( state, _site.feed_ID ) : undefined;
		}

		return {
			// Use feedId for following check as it's more reliable than feedUrl
			// feedUrl may be undefined when filtered by safeLink() security function (non-HTTP/HTTPS URLs)
			// feedId is always present and lookup by ID is more direct
			following: _feedId ? isFollowing( state, { feedId: _feedId } ) : false,
			hasOrganization: hasReaderFollowOrganization( state, _feedId, _siteId ),
			isEmailBlocked: getUserSetting( state, 'subscription_delivery_email_blocked' ),
			isWPForTeamsItem: isSiteWPForTeams( state, _siteId ) || isFeedWPForTeams( state, _feedId ),
			subscriptionId: _feed?.subscription_id,
			blogOwner: _feed?.blog_owner,
		};
	}, shallowEqual );

	const openSuggestedFollowsModal = ( followClicked ) => {
		setIsSuggestedFollowsModalOpen( followClicked );
	};

	const onCloseSuggestedFollowModal = () => {
		setIsSuggestedFollowsModalOpen( false );
	};

	const markAllAsSeen = () => {
		dispatch( recordReaderTracksEvent( 'calypso_reader_mark_all_as_seen_clicked' ) );

		dispatch(
			requestMarkAllAsSeen( {
				identifier: streamKey,
				feedIds: [ feed.feed_ID ],
				feedUrls: [ feed.URL ],
			} )
		);
	};

	return (
		<div className="reader-feed-header__follow">
			<div className="reader-feed-header__follow-and-settings">
				{ finalSiteUrl && (
					<div className="reader-feed-header__follow-button">
						<div className="reader-feed-header__follow-button-and-settings">
							<ReaderFollowButton
								siteUrl={ finalSiteUrl }
								hasButtonStyle
								iconSize={ 24 }
								onFollowToggle={ openSuggestedFollowsModal }
								followingLabel={ translate( 'Subscribed' ) }
							/>

							{ site && following && ! isEmailBlocked && (
								<div className="reader-feed-header__email-settings">
									<ReaderSiteNotificationSettings
										iconSize={ 24 }
										showLabel={ false }
										siteId={ siteId }
										subscriptionId={ subscriptionId }
									/>
								</div>
							) }
						</div>
						{ ( following || isRecommended ) && (
							<RecommendButton
								isLoading={ isRequestingRecommendedBlogs }
								isRecommended={ isRecommended }
								onClick={ toggleRecommended }
							/>
						) }
					</div>
				) }
			</div>
			{ isEligibleForUnseen( { isWPForTeamsItem, hasOrganization } ) && feed && (
				<button
					onClick={ markAllAsSeen }
					className="reader-feed-header__seen-button"
					disabled={ feed.unseen_count === 0 }
				>
					<Gridicon icon="visible" size={ 24 } />
					<span
						className="reader-feed-header__visibility"
						title={ translate( 'Mark all as seen' ) }
					>
						{ translate( 'Mark all as seen' ) }
					</span>
				</button>
			) }
			{ siteId && (
				<ReaderSuggestedFollowsDialog
					onClose={ onCloseSuggestedFollowModal }
					siteId={ +siteId }
					isVisible={ isSuggestedFollowsModalOpen }
					author={ blogOwner }
					prefetch
				/>
			) }
		</div>
	);
}
