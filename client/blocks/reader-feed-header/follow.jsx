import { Gridicon } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useState, useEffect } from 'react';
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
import { hasReaderFollowOrganization, isFollowing } from 'calypso/state/reader/follows/selectors';
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

	const { following, hasOrganization, isEmailBlocked, isWPForTeamsItem, subscriptionId } =
		useSelector( ( state ) => {
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
				following: _feed && isFollowing( state, { feedUrl: _feed.feed_URL } ),
				hasOrganization: hasReaderFollowOrganization( state, _feedId, _siteId ),
				isEmailBlocked: getUserSetting( state, 'subscription_delivery_email_blocked' ),
				isWPForTeamsItem: isSiteWPForTeams( state, _siteId ) || isFeedWPForTeams( state, _feedId ),
				subscriptionId: _feed?.subscription_id,
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
				{ siteUrl && (
					<div className="reader-feed-header__follow-button">
						<div className="reader-feed-header__follow-button-and-settings">
							<ReaderFollowButton
								siteUrl={ feed?.feed_URL || siteUrl }
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
				/>
			) }
		</div>
	);
}
