import { recordTracksEvent } from '@automattic/calypso-analytics';
import { LoadingPlaceholder } from '@automattic/components';
import { useQueryClient } from '@tanstack/react-query';
import { Button, __experimentalHStack as HStack } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { Icon, check } from '@wordpress/icons';
import React, { useMemo, useState, ComponentType, useEffect, useCallback, useRef } from 'react';
import ConnectedReaderSubscriptionListItem from 'calypso/blocks/reader-subscription-list-item/connected';
import { SiteIcon } from 'calypso/blocks/site-icon';
import { trackScrollPage } from 'calypso/reader/controller-helper';
import { useFeedQuery } from 'calypso/reader/data/feed';
import { useSite } from 'calypso/reader/data/site';
import { prefetchInfiniteStream } from 'calypso/reader/data/stream';
import ReaderFollowButton from 'calypso/reader/follow-button';
import { getFeedUrl } from 'calypso/reader/get-helpers';
import { READER_ONBOARDING_TRACKS_EVENT_PREFIX } from 'calypso/reader/onboarding-rsm/constants';
import { StepIndicator } from 'calypso/reader/onboarding-rsm/step-indicator';
import Stream from 'calypso/reader/stream';
import { useDispatch } from 'calypso/state';
import { nextSelectedSite } from './selection';
import { type CardData, useSubscribeRecommendations } from './use-subscribe-recommendations';
import SubscribeVerificationNudge from './verificationNudge';

import './style.scss';

interface SubscribeModalProps {
	promptVerification: boolean;
	onFinish: () => void;
}

interface StreamProps {
	streamKey: string;
	className?: string;
	followSource?: string;
	useCompactCards?: boolean;
	wideLayout?: boolean;
	showBylineSecondarySiteLink?: boolean;
	trackScrollPage?: (
		path: string,
		title: string,
		category: string,
		readerView: string,
		pageNum: number
	) => void;
}

const TypedStream: ComponentType< StreamProps > = Stream as ComponentType< StreamProps >;

const SITES_PER_PAGE = 6;

// Renders the body of the "discover" step. The shared <Modal> wrapper is
// provided by the parent (`ReaderOnboardingRsm`); this component is only
// mounted while the step is active. X-out / escape are handled by the
// wrapper's `onRequestClose`, which also runs the same close-side-effects
// (data refresh, analytics) that `handleClose` previously did inline.
const SubscribeModal: React.FC< SubscribeModalProps > = ( { promptVerification, onFinish } ) => {
	const {
		recommendations,
		isLoading,
		isValidating,
		hasNoRecommendations,
		followedTagSlugs,
		markSessionFollow,
	} = useSubscribeRecommendations();

	const [ currentPage, setCurrentPage ] = useState( 0 );
	const [ selectedSite, setSelectedSite ] = useState< CardData | null >( null );
	const { data: selectedFeed } = useFeedQuery( selectedSite?.feed_ID );
	// Pull the WP.com Reader site record once the React Query cache has it.
	// Curated entries with `site_ID: 0` never trigger a fetch (the hook is
	// disabled for non-positive ids). For WP.com sites the record exposes the
	// canonical `feed_URL` which `getFeedUrl` prefers over the feed's own URL.
	const { site: selectedReaderSite } = useSite(
		selectedSite && selectedSite.site_ID > 0 ? selectedSite.site_ID : undefined
	);
	const selectedFeedIconUrl = selectedFeed?.site_icon ?? selectedFeed?.image;
	// Subscribing via the curated `site_URL` (often a bare hostname like `design-milk.com`)
	// can fail with `invalid_feed` for non-WP.com sites because the WP.com follow API has to
	// auto-discover a feed and not all sites resolve. Mirror the
	// `getFeedUrl({ feed, site })` derivation that the list-item path uses internally
	// (precedence: `site.feed_URL` → `feed.feed_URL || feed.URL` → bare `site_URL`)
	// so both subscribe paths agree on the URL the follow API ends up with.
	const selectedFollowUrl =
		getFeedUrl( {
			feed: selectedFeed ?? undefined,
			site: selectedReaderSite ?? undefined,
		} ) ||
		selectedSite?.site_URL ||
		'';
	const dispatch = useDispatch();
	const queryClient = useQueryClient();

	const maxPages = Math.ceil( recommendations.length / SITES_PER_PAGE ) - 1;

	const displayedRecommendations = useMemo(
		() => recommendations.slice( 0, ( currentPage + 1 ) * SITES_PER_PAGE ),
		[ recommendations, currentPage ]
	);

	const recommendationIdsKey = recommendations.map( ( site ) => site.feed_ID ).join( ',' );
	const recommendationsRef = useRef( recommendations );
	recommendationsRef.current = recommendations;

	// Notify the hook when the user follows a feed inside the modal so a
	// pinned card stays visible (showing "Subscribed") even after the follows
	// slice excludes it, while pinned cards that turn out to be pre-existing
	// follows can still be pruned in the background.
	const handleFollowToggle = useCallback(
		( feedId: number, isFollowing: boolean ) => {
			if ( isFollowing ) {
				markSessionFollow( feedId );
			}
		},
		[ markSessionFollow ]
	);

	// Tracks which feeds we've already kicked off a stream prefetch for, so growing
	// recommendation lists don't re-prefetch the same feed as cards trickle in from validation.
	const prefetchedFeedIdsRef = useRef< Set< number > >( new Set() );

	const handleLoadMore = useCallback( () => {
		recordTracksEvent( `${ READER_ONBOARDING_TRACKS_EVENT_PREFIX }clicked_load_more`, {
			page: currentPage,
		} );
		setCurrentPage( ( prevPage ) => ( prevPage < maxPages ? prevPage + 1 : prevPage ) );
	}, [ maxPages, currentPage ] );

	useEffect( () => {
		for ( const site of recommendationsRef.current ) {
			if ( prefetchedFeedIdsRef.current.has( site.feed_ID ) ) {
				continue;
			}
			prefetchedFeedIdsRef.current.add( site.feed_ID );
			prefetchInfiniteStream( queryClient, dispatch, {
				streamKey: `feed:${ site.feed_ID }`,
			} ).catch( () => null );
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps -- keyed by id list, not array identity
	}, [ recommendationIdsKey, dispatch, queryClient ] );

	useEffect( () => {
		setCurrentPage( 0 );
		setSelectedSite( null );
		prefetchedFeedIdsRef.current = new Set();
	}, [ followedTagSlugs ] );

	// Keep the preview-column selection in sync with the visible list — see
	// `nextSelectedSite` for the case breakdown. Notably, this handles a
	// pinned card being pruned from `recommendations` after paginated follows
	// reveal it was already subscribed: without repointing the preview column
	// would keep rendering a stream for a site that's no longer in the list.
	useEffect( () => {
		const next = nextSelectedSite( selectedSite, recommendations );
		if ( next !== undefined ) {
			setSelectedSite( next );
		}
	}, [ recommendations, selectedSite ] );

	const handleItemClick = useCallback(
		( site: CardData ) => {
			if ( site.feed_ID !== selectedSite?.feed_ID ) {
				const previewContainer = document.querySelector(
					'.subscribe-modal__preview-stream-container'
				);
				if ( previewContainer ) {
					previewContainer.scrollTop = 0;
				}
				recordTracksEvent(
					`${ READER_ONBOARDING_TRACKS_EVENT_PREFIX }discover_modal_site_previewed`,
					{
						feed_id: site.feed_ID,
						site_id: site.site_ID,
						site_name: site.site_name,
					}
				);
			}
			setSelectedSite( site );
		},
		[ selectedSite ]
	);

	const handleFinish = useCallback( () => {
		onFinish();
	}, [ onFinish ] );

	return (
		<>
			{ promptVerification && <SubscribeVerificationNudge /> }
			{ /* Site + feed metadata are prefetched inside `useSubscribeRecommendations`
			     via `useQueries( readSiteQuery / readFeedQuery )`; nothing else needed
			     at this level. */ }
			<div className="subscribe-modal__container">
				<div className="subscribe-modal__content">
					<div className="subscribe-modal__intro">
						<h2 className="subscribe-modal__title">{ __( "Discover sites that you'll love" ) }</h2>
						<p className="subscribe-modal__description">
							{ __(
								'Preview sites by clicking below, then subscribe to any site that inspires you.'
							) }
						</p>
					</div>
					<div className="subscribe-modal__columns">
						<div className="subscribe-modal__site-list-column">
							{ ( isLoading || isValidating ) && recommendations.length === 0 && (
								<LoadingPlaceholder />
							) }
							{ hasNoRecommendations && (
								<p>{ __( 'No recommendations available at the moment.' ) }</p>
							) }
							{ recommendations.length > 0 && (
								<div className="subscribe-modal__recommended-sites">
									{ displayedRecommendations.map( ( site: CardData ) => (
										<ConnectedReaderSubscriptionListItem
											key={ site.feed_ID }
											feedId={ site.feed_ID }
											siteId={ site.site_ID }
											site={ site }
											url={ site.feed_URL }
											// Pass the canonical feed URL from onboarding data so
											// the list item does not derive subscribe URL from
											// `site_URL` alone.
											showLastUpdatedDate={ false }
											showNotificationSettings={ false }
											showFollowedOnDate={ false }
											followSource="reader-onboarding-modal"
											replaceStreamClickWithItemClick
											onItemClick={ () => handleItemClick( site ) }
											onFollowToggle={ ( isFollowing: boolean ) =>
												handleFollowToggle( site.feed_ID, isFollowing )
											}
											isSelected={ selectedSite?.feed_ID === site.feed_ID }
										/>
									) ) }
								</div>
							) }
							{ currentPage < maxPages && (
								<Button
									className="subscribe-modal__load-more-button"
									onClick={ handleLoadMore }
									variant="link"
								>
									{ __( 'Load more recommendations' ) }
								</Button>
							) }
						</div>
						<div className="subscribe-modal__preview-column">
							<div className="subscribe-modal__preview-placeholder">
								{ selectedSite && (
									<>
										<div className="subscribe-modal__preview-stream-header">
											<div className="subscribe-modal__preview-site">
												<SiteIcon size={ 36 } iconUrl={ selectedFeedIconUrl } />
												<span className="subscribe-modal__preview-site-title">
													{ selectedSite.site_name }
												</span>
											</div>
											<ReaderFollowButton
												siteUrl={ selectedFollowUrl }
												feedId={ selectedSite.feed_ID }
												siteId={ selectedSite.site_ID }
												followSource="reader-onboarding-modal"
												hasButtonStyle
												onFollowToggle={ ( isFollowing: boolean ) =>
													handleFollowToggle( selectedSite.feed_ID, isFollowing )
												}
												followIcon={ <></> }
												followingIcon={
													<Icon
														key="following"
														className="reader-following-feed"
														icon={ check }
														size={ 18 }
													/>
												}
											/>
										</div>
										<div
											className="subscribe-modal__preview-stream-container"
											// @ts-expect-error For some reason there's no inert type.
											// `inert` removes preview stream from tab order + a11y tree (preview is non-interactive).
											inert
										>
											<TypedStream
												streamKey={ `feed:${ selectedSite.feed_ID }` }
												className="is-site-stream subscribe-modal__preview-stream no-padding"
												followSource="reader_subscribe_modal"
												useCompactCards
												showBylineSecondarySiteLink={ false }
												trackScrollPage={ trackScrollPage.bind( null ) }
											/>
										</div>
									</>
								) }
							</div>
						</div>
					</div>
				</div>
			</div>
			<div className="reader-onboarding-modal__footer">
				<HStack justify="space-between" className="reader-onboarding-modal__footer-actions">
					<StepIndicator totalSteps={ 3 } currentStep={ 3 } />
					<HStack spacing={ 2 } justify="right" className="reader-onboarding-modal__footer-buttons">
						<Button
							__next40pxDefaultSize
							onClick={ handleFinish }
							variant="secondary"
							disabled={ promptVerification }
							accessibleWhenDisabled
						>
							{ __( 'Finish' ) }
						</Button>
					</HStack>
				</HStack>
			</div>
		</>
	);
};

export default SubscribeModal;
