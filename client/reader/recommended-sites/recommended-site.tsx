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
import { Railcar } from 'calypso/data/marketplace/types';
import connectSite from 'calypso/lib/reader-connect-site';
import {
	getSiteName,
	getSiteDescription,
	getSiteUrl,
	getSiteDomain,
} from 'calypso/reader/get-helpers';
import { getStreamUrl } from 'calypso/reader/route';
import { recordFollow } from 'calypso/reader/stats';
import { Feed } from 'calypso/state/data-layer/wpcom/read/feed/types';
import { Site } from 'calypso/state/data-layer/wpcom/read/sites/types';
import { recordReaderTracksEvent } from 'calypso/state/reader/analytics/actions';
import { follow } from 'calypso/state/reader/follows/actions';
import isReaderFollowFeedLoading from 'calypso/state/reader/follows/selectors/is-reader-follow-feed-loading';
import { dismissSite } from 'calypso/state/reader/site-dismissals/actions';
import { READER_FOLLOWING_MANAGE_RECOMMENDATION } from '../follow-sources';
import {
	recordAction,
	recordRailcar,
	recordTrackWithRailcar,
	recordTracksRailcarRender,
} from '../stats';
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
	}, [ isSubscribeLoading, wasSubscribeLoading, queryClient ] );
};

const enum RecommendedSiteEvent {
	Dismissed = 'calypso_reader_recommended_site_dismissed',
}

const enum ReaderEvent {
	FeedLinkClicked = 'calypso_reader_feed_link_clicked',
	SiteUrlClicked = 'calypso_reader_site_url_clicked',
	AvatarClicked = 'calypso_reader_avatar_clicked',
}

type RecommendedSiteProps = {
	siteId: number;
	feedId?: number;
	siteTitle: string;
	siteDescription: string;
	siteDomain: string;
	siteUrl: string;
	streamUrl: string;
	siteIcon?: string;
	feedIcon?: string;
	railcar?: Railcar;
	uiPosition?: number; // For analytics
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
			recordTracksRailcarRender( 'recommended_site', railcar, {
				ui_algo: 'following_manage_recommended_site',
				ui_position: uiPosition,
			} );
		}
	}, [ railcar, uiPosition ] );

	const recordEvent = ( eventName: ReaderEvent ) => {
		const eventProps = {
			blog_id: siteId,
			feed_id: feedId,
			source: READER_FOLLOWING_MANAGE_RECOMMENDATION,
		};

		dispatch( recordReaderTracksEvent( eventName, eventProps ) as unknown as AnyAction );

		if ( railcar ) {
			recordRailcar( eventName, railcar, eventProps );
		}
	};

	return (
		<Card className="recommended-site" as="li">
			<Flex justify="flex-end">
				<Button
					className="recommended-site__dismiss-button"
					icon={ close }
					iconSize={ 20 }
					title={ translate( 'Dismiss this recommendation' ) }
					onClick={ () => {
						recordTrackWithRailcar( RecommendedSiteEvent.Dismissed, railcar, {
							ui_position: uiPosition,
						} );
						recordAction( RecommendedSiteEvent.Dismissed );
						dispatch( dismissSite( { siteId, seed: recommendedSitesSeed } ) );
					} }
				/>
			</Flex>
			<HStack justify="flex-start" spacing="4">
				<ReaderAvatar
					siteIcon={ siteIcon }
					feedIcon={ feedIcon }
					onClick={ () => recordEvent( ReaderEvent.AvatarClicked ) }
					isCompact
				/>
				<VStack spacing={ 0 }>
					<a
						className="recommended-site__site-title"
						href={ streamUrl }
						onClick={ () => recordEvent( ReaderEvent.FeedLinkClicked ) }
					>
						{ siteTitle }
					</a>
					<ExternalLink
						className="recommended-site__site-url"
						href={ siteUrl }
						onClick={ () => recordEvent( ReaderEvent.SiteUrlClicked ) }
					>
						{ siteDomain }
					</ExternalLink>
				</VStack>
			</HStack>
			<p className="recommended-site__site-description">{ siteDescription }</p>
			<Button
				isPrimary
				isBusy={ isSubscribeLoading }
				disabled={ isSubscribeLoading }
				className="recommended-site__subscribe-button"
				onClick={ () => {
					recordFollow( siteUrl, railcar, {
						follow_source: READER_FOLLOWING_MANAGE_RECOMMENDATION,
					} );
					dispatch(
						follow( siteUrl, null, {
							siteId,
							seed: recommendedSitesSeed,
							siteTitle,
						} ) as AnyAction
					);
				} }
			>
				{ translate( 'Subscribe' ) }
			</Button>
		</Card>
	);
};

type ConnectSiteComponentProps = {
	siteId?: number;
	feedId?: number;
	site?: Site;
	feed?: Feed;
	railcar?: Railcar;
	uiPosition?: number; // For analytics
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

	if ( ! railcar ) {
		throw new Error( 'Railcar is required to render recommended site' );
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
