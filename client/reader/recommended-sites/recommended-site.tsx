import {
	recordTrainTracksRender,
	recordTrainTracksInteract,
	Railcar,
} from '@automattic/calypso-analytics';
import { SubscriptionManager } from '@automattic/data-stores';
import { useQueryClient } from '@tanstack/react-query';
import {
	Button,
	Card,
	ExternalLink,
	Flex,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { usePrevious } from '@wordpress/compose';
import { close } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AnyAction } from 'redux';
import ReaderAvatar from 'calypso/blocks/reader-avatar';
import { useSubscriptionManagerContext } from 'calypso/landing/subscriptions/components/subscription-manager-context';
import {
	useRecordSiteIconClicked,
	useRecordSiteTitleClicked,
	useRecordSiteUrlClicked,
	useRecordRecommendedSiteSubscribed,
	useRecordRecommendedSiteDismissed,
} from 'calypso/landing/subscriptions/tracks';
import { gaRecordEvent } from 'calypso/lib/analytics/ga';
import { bumpStat } from 'calypso/lib/analytics/mc';
import connectSite from 'calypso/lib/reader-connect-site';
import {
	getSiteName,
	getSiteDescription,
	getSiteUrl,
	getSiteDomain,
} from 'calypso/reader/get-helpers';
import { getStreamUrl } from 'calypso/reader/route';
import { Feed } from 'calypso/state/data-layer/wpcom/read/feed/types';
import { Site } from 'calypso/state/data-layer/wpcom/read/sites/types';
import { follow } from 'calypso/state/reader/follows/actions';
import isReaderFollowFeedLoading from 'calypso/state/reader/follows/selectors/is-reader-follow-feed-loading';
import { dismissSite } from 'calypso/state/reader/site-dismissals/actions';
import { RecommendedSitePlaceholder } from './placeholder';
import { seed as recommendedSitesSeed } from './recommended-sites';

/**
 * This hook invalidates the cache for site subscriptions when the "subscribe" mutation is completed.
 * This is necessary because the site subscriptions list uses react-query for state management, while the reader uses redux with data-layer middleware for its state management.
 * Since these two state management systems are not aware of each other, we need to manually invalidate the cache when the "subscribe" mutation is completed.
 */
const useInvalidateSiteSubscriptionsCache = ( isSubscribeLoading: boolean ) => {
	const wasSubscribeLoading = usePrevious( isSubscribeLoading );
	const siteSubscriptionsCacheKey = SubscriptionManager.useCacheKey( [
		'read',
		'site-subscriptions',
	] );
	const queryClient = useQueryClient();
	useEffect( () => {
		if ( wasSubscribeLoading && ! isSubscribeLoading ) {
			queryClient.invalidateQueries( siteSubscriptionsCacheKey );
		}
	}, [ isSubscribeLoading, wasSubscribeLoading, queryClient, siteSubscriptionsCacheKey ] );
};

type RecommendedSiteProps = {
	siteId: number;
	feedId?: number; // Used for train-tracks
	siteTitle: string;
	siteDescription: string;
	siteDomain: string;
	siteUrl: string;
	streamUrl: string;
	siteIcon?: string;
	feedIcon?: string;
	railcar?: Railcar; // Used for train-tracks
	uiPosition?: number; // Used for train-tracks
};

const RecommendedSite = ( {
	siteId,
	feedId,
	siteTitle,
	streamUrl,
	siteDescription,
	siteDomain,
	siteUrl,
	siteIcon,
	feedIcon,
	railcar,
	uiPosition,
}: RecommendedSiteProps ) => {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const isSubscribeLoading: boolean = useSelector( ( state ) =>
		isReaderFollowFeedLoading( state, siteUrl )
	);

	useInvalidateSiteSubscriptionsCache( isSubscribeLoading );

	useEffect( () => {
		if ( railcar ) {
			// reader: railcar, ui_algo: following_manage_recommended_site, ui_position, fetch_algo, fetch_position, rec_blog_id (incorrect: fetch_lang, action)
			// subscriptions: railcar, ui_algo: subscriptions_recommended_site, ui_position, fetch_algo, fetch_position, rec_blog_id
			recordTrainTracksRender( {
				railcarId: railcar.railcar,
				uiAlgo: 'subscriptions_recommended_site',
				uiPosition: uiPosition ?? -1,
				fetchAlgo: railcar.fetch_algo,
				fetchPosition: railcar.fetch_position,
				recBlogId: railcar.rec_blog_id,
			} );
		}
	}, [ railcar, uiPosition ] );

	const { isReaderPortal } = useSubscriptionManagerContext();

	const blog_id = String( siteId );

	const recordSiteIconClicked = useRecordSiteIconClicked();
	const recordSiteTitleClicked = useRecordSiteTitleClicked();
	const recordSiteUrlClicked = useRecordSiteUrlClicked();
	const siteTracksEventProps = {
		blog_id,
		source: 'recommended-sites',
		...( feedId === undefined ? {} : { feed_id: String( feedId ) } ),
	};

	const recordRecommendedSiteSubscribed = useRecordRecommendedSiteSubscribed();
	const recordRecommendedSiteDismissed = useRecordRecommendedSiteDismissed();

	const handleDismissButtonOnClick = () => {
		// reader: calypso_reader_recommended_site_dismissed
		// subscriptions: calypso_subscriptions_recommended_site_dismissed
		recordRecommendedSiteDismissed( {
			blog_id,
			url: siteUrl,
			source: 'recommended-site-dismiss-button',
		} );

		if ( railcar ) {
			// reader: action, ui_algo, ui_position (incorrect: only railcar & action accepted)
			// subscriptions: railcar, action
			recordTrainTracksInteract( {
				railcarId: railcar.railcar,
				action: 'recommended_site_dismissed',
			} );
		}

		if ( isReaderPortal ) {
			// reader: calypso_reader_recommended_site_dismissed (incorrect: too long)
			// subscriptions: dismissed_recommended_site
			bumpStat( 'reader_actions', 'dismissed_recommended_site' );
		}

		dispatch( dismissSite( { siteId, seed: recommendedSitesSeed } ) );
	};

	const handleSubscribeButtonOnClick = () => {
		// reader: calypso_reader_site_followed (ui_algo, url, source, follow_source)
		// subscriptions: calypso_subscriptions_recommended_site_subscribed & calypso_subscriptions_site_subscribed (blog_id, url, source, ui_algo: (removed), follow_source: (removed))
		recordRecommendedSiteSubscribed( {
			blog_id,
			url: siteUrl,
			source: 'recommended-site-subscribe-button',
		} );

		if ( railcar ) {
			// reader: action: site_followed, railcar, ui_algo, ui_position, fetch_algo, fetch_position, fetch_lang,rec_blog_id, (incorrect: only railcar & action accepted)
			// subscriptions: action: recommended_site_subscribed, railcar
			recordTrainTracksInteract( {
				railcarId: railcar.railcar,
				action: 'recommended_site_subscribed',
			} );
		}

		if ( isReaderPortal ) {
			// reader: reader-following-manage-recommendation
			// subscriptions: reader-subscriptions-sites-recommendation
			bumpStat( 'reader_follows', 'reader-subscriptions-sites-recommendation' );

			// reader: followed_blog
			// subscriptions: subscribed_blog
			bumpStat( 'reader_actions', 'subscribed_blog' );

			// reader: 'Reader', 'Clicked Follow Blog', 'reader-following-manage-recommendation'
			// subscriptions: 'Reader', 'Clicked Subscribed Blog', 'reader-subscriptions-sites-recommendation'
			gaRecordEvent(
				'Reader',
				'Clicked Subscribed Blog',
				'reader-subscriptions-sites-recommendation'
			);
		}

		dispatch(
			follow( siteUrl, null, {
				siteId,
				seed: recommendedSitesSeed,
				siteTitle,
			} ) as AnyAction
		);
	};

	return (
		<Card className="recommended-site" as="li">
			<Flex justify="flex-end">
				<Button
					className="recommended-site__dismiss-button"
					icon={ close }
					iconSize={ 20 }
					title={ translate( 'Dismiss this recommendation' ) }
					onClick={ handleDismissButtonOnClick }
				/>
			</Flex>
			<HStack justify="flex-start" spacing="4">
				<ReaderAvatar
					siteIcon={ siteIcon }
					feedIcon={ feedIcon }
					onClick={ () => recordSiteIconClicked( siteTracksEventProps ) }
					isCompact
				/>
				<VStack spacing={ 0 }>
					<a
						className="recommended-site__site-title"
						href={ streamUrl }
						onClick={ () => recordSiteTitleClicked( siteTracksEventProps ) }
					>
						{ siteTitle }
					</a>
					<ExternalLink
						className="recommended-site__site-url"
						href={ siteUrl }
						onClick={ () => recordSiteUrlClicked( siteTracksEventProps ) }
					>
						{ siteDomain }
					</ExternalLink>
				</VStack>
			</HStack>
			<p className="recommended-site__site-description">{ siteDescription }</p>
			<Button
				variant="primary"
				isBusy={ isSubscribeLoading }
				disabled={ isSubscribeLoading }
				className="recommended-site__subscribe-button"
				onClick={ handleSubscribeButtonOnClick }
			>
				{ translate( 'Subscribe' ) }
			</Button>
		</Card>
	);
};

type ConnectSiteComponentProps = {
	siteId?: number;
	feedId?: number; // Used for train-tracks
	site?: Site;
	feed?: Feed;
	railcar?: Railcar; // Used for train-tracks
	uiPosition?: number; // Used for train-tracks
};

const RecommendedSiteWithConnectedSite = ( {
	siteId,
	feedId,
	site,
	feed,
	railcar,
	uiPosition,
}: ConnectSiteComponentProps ) => {
	if ( typeof siteId !== 'number' || ! site ) {
		return <RecommendedSitePlaceholder />;
	}

	const siteTitle = getSiteName( { site, feed } );
	const siteDescription = getSiteDescription( { site, feed } );
	const siteDomain = getSiteDomain( { site, feed } );
	const siteUrl = getSiteUrl( { site, feed } );
	const streamUrl = getStreamUrl( feedId, siteId );
	const siteIcon = site.icon?.img;
	const feedIcon = feed?.image;

	return (
		<RecommendedSite
			siteId={ siteId }
			feedId={ feedId }
			siteTitle={ siteTitle }
			siteDescription={ siteDescription }
			siteDomain={ siteDomain }
			siteUrl={ siteUrl }
			streamUrl={ streamUrl }
			siteIcon={ siteIcon }
			feedIcon={ feedIcon }
			railcar={ railcar }
			uiPosition={ uiPosition }
		/>
	);
};

export default connectSite(
	RecommendedSiteWithConnectedSite
) as React.FC< ConnectSiteComponentProps >;
