import { recordTracksEvent } from '@automattic/calypso-analytics';
import { LoadingPlaceholder } from '@automattic/components';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, __experimentalHStack as HStack } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { Icon, check } from '@wordpress/icons';
import { getLocaleSlug } from 'i18n-calypso';
import React, { useMemo, useState, ComponentType, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import ConnectedReaderSubscriptionListItem from 'calypso/blocks/reader-subscription-list-item/connected';
import { SiteIcon } from 'calypso/blocks/site-icon';
import { useFollowedReaderTags } from 'calypso/data/reader/use-reader-tags';
import wpcom from 'calypso/lib/wp';
import { trackScrollPage } from 'calypso/reader/controller-helper';
import ReaderFollowButton from 'calypso/reader/follow-button';
import { READER_ONBOARDING_TRACKS_EVENT_PREFIX } from 'calypso/reader/onboarding-rsm/constants';
import { curatedBlogs } from 'calypso/reader/onboarding-rsm/curated-blogs';
import { StepIndicator } from 'calypso/reader/onboarding-rsm/step-indicator';
import Stream from 'calypso/reader/stream';
import { useDispatch } from 'calypso/state';
import { getFeed } from 'calypso/state/reader/feeds/selectors';
import { requestPage, requestPaginatedStream } from 'calypso/state/reader/streams/actions';
import SubscribeVerificationNudge from './verificationNudge';

import './style.scss';

interface SubscribeModalProps {
	promptVerification: boolean;
	onClose: () => void;
}

interface CardData {
	feed_ID: number;
	site_ID: number;
	site_URL: string;
	site_name: string;
}

interface Card {
	type: string;
	data: CardData[];
}

interface StreamProps {
	streamKey: string;
	className?: string;
	followSource?: string;
	useCompactCards?: boolean;
	wideLayout?: boolean;
	trackScrollPage?: (
		path: string,
		title: string,
		category: string,
		readerView: string,
		pageNum: number
	) => void;
}

const TypedStream: ComponentType< StreamProps > = Stream as ComponentType< StreamProps >;

// Renders the body of the "discover" step. The shared <Modal> wrapper is
// provided by the parent (`ReaderOnboardingRsm`); this component is only
// mounted while the step is active. X-out / escape are handled by the
// wrapper's `onRequestClose`, which also runs the same close-side-effects
// (data refresh, analytics) that `handleClose` previously did inline.
const SubscribeModal: React.FC< SubscribeModalProps > = ( { promptVerification, onClose } ) => {
	const { data: followedTags } = useFollowedReaderTags();

	const followedTagSlugs = useMemo(
		() => followedTags?.map( ( tag ) => tag.slug ) ?? [],
		[ followedTags ]
	);

	const [ currentPage, setCurrentPage ] = useState( 0 );
	const [ selectedSite, setSelectedSite ] = useState< CardData | null >( null );
	const selectedFeed = useSelector( ( state: object ) =>
		selectedSite ? getFeed( state, selectedSite.feed_ID ) : null
	);
	const selectedFeedIconUrl =
		( selectedFeed as { site_icon?: string; image?: string } | null )?.site_icon ??
		( selectedFeed as { site_icon?: string; image?: string } | null )?.image;
	const dispatch = useDispatch();
	const currentLocale = getLocaleSlug();
	const SITES_PER_PAGE = 6;
	const queryClient = useQueryClient();

	const { data: apiRecommendedSites = [], isLoading } = useQuery( {
		queryKey: [ 'reader-onboarding-recommended-sites', followedTagSlugs, currentLocale ],
		queryFn: () =>
			wpcom.req.get(
				{
					path: '/read/tags/cards',
					apiNamespace: 'wpcom/v2',
				},
				{
					tags: followedTagSlugs,
					site_recs_per_card: 18,
					tag_recs_per_card: 0,
				}
			),
		refetchOnMount: 'always',
		select: ( data: { cards: Card[] } ) => {
			const recommendedBlogsCard = data.cards.find(
				( card: Card ) => card.type === 'recommended_blogs'
			);

			return recommendedBlogsCard
				? recommendedBlogsCard.data.map( ( site: CardData & { URL?: string } ) => ( {
						...site,
						site_URL: site.URL || site.site_URL,
				  } ) )
				: [];
		},
		staleTime: Infinity,
		enabled: followedTagSlugs.length > 0,
	} );

	const combinedRecommendations = useMemo( () => {
		if ( isLoading ) {
			return [];
		}
		const isEnglish = currentLocale?.startsWith( 'en' );

		// Get list of curated recommendations only if the language is English.
		const curatedRecommendations = isEnglish
			? followedTagSlugs
					.flatMap( ( tag ) => curatedBlogs[ tag ] || [] )
					.map( ( blog ) => ( { ...blog, weight: 1, isCurated: true } ) )
			: [];

		// Get list of API recommended blogs.
		const apiRecommendations = apiRecommendedSites.map( ( site ) => ( {
			...site,
			weight: 1,
			isCurated: false,
		} ) );

		// Combine all recommendations.
		const allRecommendations = [ ...curatedRecommendations, ...apiRecommendations ];

		// Increase "weight" for blogs that match multiple tags.
		const blogWeights = allRecommendations.reduce< Record< number, number > >( ( acc, blog ) => {
			acc[ blog.feed_ID ] = ( acc[ blog.feed_ID ] || 0 ) + blog.weight;
			return acc;
		}, {} );

		// Remove duplicates, prioritizing curated blogs.
		const uniqueRecommendations = Object.values(
			allRecommendations.reduce<
				Record< number, CardData & { weight: number; isCurated: boolean } >
			>( ( acc, blog ) => {
				if ( ! acc[ blog.feed_ID ] || blog.isCurated ) {
					acc[ blog.feed_ID ] = { ...blog, weight: blogWeights[ blog.feed_ID ] };
				}
				return acc;
			}, {} )
		);

		// Sort recommendations: curated first, then by "weight" (i.e. how many tags it matches).
		const sortedRecommendations = uniqueRecommendations.sort( ( a, b ) => {
			if ( a.isCurated !== b.isCurated ) {
				return a.isCurated ? -1 : 1;
			}
			return b.weight - a.weight;
		} );

		// Limit to 18 recommendations.
		return sortedRecommendations.slice( 0, 18 );
	}, [ followedTagSlugs, apiRecommendedSites, isLoading, currentLocale ] );

	const maxPages = Math.ceil( combinedRecommendations.length / SITES_PER_PAGE ) - 1; // -1 because pages are 0-based.

	const displayedRecommendations = useMemo( () => {
		// Show all items up to the current page.
		return combinedRecommendations.slice( 0, ( currentPage + 1 ) * SITES_PER_PAGE );
	}, [ combinedRecommendations, currentPage ] );

	const handleLoadMore = useCallback( () => {
		recordTracksEvent( `${ READER_ONBOARDING_TRACKS_EVENT_PREFIX }clicked_load_more`, {
			page: currentPage,
		} );
		// Only increment the page if we haven't reached the end.
		setCurrentPage( ( prevPage ) => ( prevPage < maxPages ? prevPage + 1 : prevPage ) );
	}, [ maxPages, currentPage ] );

	// Prefetch the first blog's feed. Only fetch one because it happens every time a tag changes.
	useEffect( () => {
		if ( combinedRecommendations.length > 0 ) {
			dispatch(
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				requestPage( { streamKey: `feed:${ combinedRecommendations[ 0 ].feed_ID }` } as any )
			);
		}
	}, [ combinedRecommendations, dispatch ] );

	// Prefetch all feed streams when the step is shown. The component only
	// mounts while the step is active, so we no longer need an `isOpen` gate.
	useEffect( () => {
		if ( combinedRecommendations.length > 0 ) {
			combinedRecommendations.forEach( ( site ) => {
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				dispatch( requestPage( { streamKey: `feed:${ site.feed_ID }` } as any ) );
			} );
		}
	}, [ combinedRecommendations, dispatch ] );

	// Reset the page and selected site when the followed tags change.
	useEffect( () => {
		setCurrentPage( 0 );
		setSelectedSite( null );
	}, [ followedTagSlugs ] );

	// Select the first site by default when recommendations are loaded.
	useEffect( () => {
		if ( displayedRecommendations.length > 0 && ! selectedSite ) {
			setSelectedSite( displayedRecommendations[ 0 ] );
		}
	}, [ displayedRecommendations, selectedSite ] );

	const handleItemClick = useCallback(
		( site: CardData ) => {
			// Only reset scroll position if selecting a different site.
			if ( site.feed_ID !== selectedSite?.feed_ID ) {
				const previewContainer = document.querySelector(
					'.subscribe-modal__preview-stream-container'
				);
				if ( previewContainer ) {
					previewContainer.scrollTop = 0;
				}
			}
			setSelectedSite( site );
		},
		[ selectedSite ]
	);

	const handleContinue = useCallback( () => {
		// Invalidate the subscriptions count query to refresh the Recent stream.
		queryClient.invalidateQueries( {
			queryKey: [ 'read', 'subscriptions-count' ],
		} );

		// Refresh the Recent stream data.
		dispatch(
			requestPaginatedStream( {
				streamKey: 'recent',
				page: 1,
				perPage: 10,
			} )
		);

		// Following-stream refresh + analytics happen in the parent's close
		// handler so that X-out / escape triggers the same side-effects.
		onClose();
	}, [ dispatch, onClose, queryClient ] );

	return (
		<>
			{ promptVerification && <SubscribeVerificationNudge /> }
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
							{ isLoading && <LoadingPlaceholder /> }
							{ ! isLoading && combinedRecommendations.length === 0 && (
								<p>{ __( 'No recommendations available at the moment.' ) }</p>
							) }
							{ ! isLoading && combinedRecommendations.length > 0 && (
								<div className="subscribe-modal__recommended-sites">
									{ displayedRecommendations.map( ( site: CardData ) => (
										<ConnectedReaderSubscriptionListItem
											key={ site.feed_ID }
											feedId={ site.feed_ID }
											siteId={ site.site_ID }
											site={ site }
											url={ site.site_URL }
											showLastUpdatedDate={ false }
											showNotificationSettings={ false }
											showFollowedOnDate={ false }
											followSource="reader-onboarding-modal"
											replaceStreamClickWithItemClick
											onItemClick={ () => handleItemClick( site ) }
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
												siteUrl={ selectedSite.site_URL }
												feedId={ selectedSite.feed_ID }
												siteId={ selectedSite.site_ID }
												followSource="reader-onboarding-modal"
												hasButtonStyle
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
										<div className="subscribe-modal__preview-stream-container">
											<TypedStream
												streamKey={ `feed:${ selectedSite.feed_ID }` }
												className="is-site-stream subscribe-modal__preview-stream no-padding"
												followSource="reader_subscribe_modal"
												useCompactCards
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
							onClick={ handleContinue }
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
