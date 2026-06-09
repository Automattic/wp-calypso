import { Gridicon } from '@automattic/components';
import { filterURLForDisplay } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import { shallowEqual } from 'react-redux';
import SiteNotificationSettings from 'calypso/blocks/reader-site-notification-settings';
import ReaderSuggestedFollowsDialog from 'calypso/blocks/reader-suggested-follows/dialog';
import { useFeedRecommendationsMutation } from 'calypso/data/reader/use-feed-recommendations-mutation';
import { useFeedQuery } from 'calypso/reader/data/feed';
import {
	useHasSiteSubscriptionOrganization,
	useIsSubscribed,
} from 'calypso/reader/data/site-subscriptions';
import ReaderFollowButton from 'calypso/reader/follow-button';
import { getFeedUrl, getSiteUrl, isEligibleForUnseen } from 'calypso/reader/get-helpers';
import { RecommendButton } from 'calypso/reader/recommend-button';
import { useDispatch, useSelector } from 'calypso/state';
import { successNotice } from 'calypso/state/notices/actions';
import { recordReaderTracksEvent } from 'calypso/state/reader/analytics/actions';
import { requestMarkAllAsSeen } from 'calypso/state/reader/seen-posts/actions';
import getUserSetting from 'calypso/state/selectors/get-user-setting';
import isSiteWPForTeams from 'calypso/state/selectors/is-site-wpforteams';
import type { AppState } from 'calypso/types';

interface ReaderFeedHeaderFollowProps {
	feed?: ReaderFeed;
	site?: ReaderSite;
	streamKey?: string;
}

interface ReaderFeed {
	feed_ID?: number;
	feed_URL?: string;
	blog_ID?: number;
	URL?: string;
	unseen_count?: number;
	subscription_id?: number;
	blog_owner?: string;
	name?: string;
}

interface ReaderSite {
	ID?: number;
	feed_ID?: number;
	feed_URL?: string;
	is_following?: boolean;
	name?: string;
}

export default function ReaderFeedHeaderFollow( props: ReaderFeedHeaderFollowProps ): JSX.Element {
	const { feed, site, streamKey } = props;
	const translate = useTranslate();
	const dispatch = useDispatch();
	const [ isSuggestedFollowsModalOpen, setIsSuggestedFollowsModalOpen ] = useState( false );
	const siteId = site?.ID;
	const feedId = feed?.feed_ID ?? site?.feed_ID;
	const { data: fetchedFeed } = useFeedQuery( feedId );
	const resolvedFeed = feed ?? fetchedFeed;
	const siteUrl = getSiteUrl( { feed: resolvedFeed, site } );
	const followFeedUrl = getFeedUrl( { feed: resolvedFeed, site } ) || undefined;
	const resolvedSiteId = siteId ?? resolvedFeed?.blog_ID;
	const followFeedId = resolvedFeed?.feed_ID;
	const reduxFollowing = useIsSubscribed( { feedUrl: followFeedUrl } );
	const hasOrganization = useHasSiteSubscriptionOrganization( followFeedId, resolvedSiteId );
	const {
		isRecommended,
		isUpdating: isRecommendationPending,
		toggleRecommended,
	} = useFeedRecommendationsMutation( feedId as number );

	const { isEmailBlocked, isWPForTeamsItem, subscriptionId, blogOwner } = useSelector(
		( state: AppState ) => {
			const _feed: ReaderFeed | undefined = resolvedFeed;

			return {
				isEmailBlocked: getUserSetting( state, 'subscription_delivery_email_blocked' ),
				isWPForTeamsItem: Boolean(
					( resolvedSiteId ? isSiteWPForTeams( state, resolvedSiteId ) : false ) ||
						( _feed?.blog_ID ? isSiteWPForTeams( state, _feed.blog_ID ) : false )
				),
				subscriptionId: _feed?.subscription_id,
				blogOwner: _feed?.blog_owner,
			};
		},
		shallowEqual
	);
	const following = reduxFollowing || !! site?.is_following;

	const openSuggestedFollowsModal = ( followClicked: boolean ) => {
		const displayName = site?.name || filterURLForDisplay( resolvedFeed?.feed_URL ?? '' );

		dispatch(
			successNotice(
				following
					? translate( 'Success! You are now unsubscribed from "%s".', { args: displayName } )
					: translate( 'Success! You are now subscribed to "%s".', { args: displayName } ),
				{ duration: 3000 }
			)
		);

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
				feedIds: [ resolvedFeed?.feed_ID ],
				feedUrls: [ resolvedFeed?.feed_URL || resolvedFeed?.URL ],
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
								feedId={ feedId }
								siteId={ siteId }
								siteUrl={ resolvedFeed?.feed_URL || siteUrl }
								hasButtonStyle
								iconSize={ 24 }
								onFollowToggle={ openSuggestedFollowsModal }
							/>

							{ site && following && ! isEmailBlocked && (
								<div className="reader-feed-header__email-settings">
									<SiteNotificationSettings
										iconSize={ 24 }
										showLabel={ false }
										siteId={ siteId }
										subscriptionId={ Number( subscriptionId ) }
									/>
								</div>
							) }
						</div>
						{ ( following || isRecommended ) && (
							<RecommendButton
								isLoading={ isRecommendationPending }
								isRecommended={ isRecommended }
								onClick={ toggleRecommended }
							/>
						) }
					</div>
				) }
			</div>
			{ isEligibleForUnseen( { isWPForTeamsItem, hasOrganization } ) && resolvedFeed && (
				<button
					onClick={ markAllAsSeen }
					className="reader-feed-header__seen-button"
					disabled={ resolvedFeed.unseen_count === 0 }
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
					postId={ null }
					siteId={ +siteId }
					isVisible={ isSuggestedFollowsModalOpen }
					author={ blogOwner }
					prefetch
				/>
			) }
		</div>
	);
}
