import { recordTracksEvent } from '@automattic/calypso-analytics';
import { LoadingPlaceholder } from '@automattic/components';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Modal, Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import clsx from 'clsx';
import { getLocaleSlug } from 'i18n-calypso';
import React, { useMemo, useState, ComponentType, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { AnyAction } from 'redux';
import ConnectedReaderSubscriptionListItem from 'calypso/blocks/reader-subscription-list-item/connected';
import wpcom from 'calypso/lib/wp';
import { trackScrollPage } from 'calypso/reader/controller-helper';
import { READER_ONBOARDING_TRACKS_EVENT_PREFIX } from 'calypso/reader/onboarding/constants';
import { curatedBlogs } from 'calypso/reader/onboarding/curated-blogs';
import Stream from 'calypso/reader/stream';
import { useDispatch } from 'calypso/state';
import { isCurrentUserEmailVerified } from 'calypso/state/current-user/selectors';
import { requestFollows } from 'calypso/state/reader/follows/actions';
import { getReaderFollows } from 'calypso/state/reader/follows/selectors';
import {
	requestPage,
	clearStream,
	requestPaginatedStream,
} from 'calypso/state/reader/streams/actions';
import { getReaderFollowedTags } from 'calypso/state/reader/tags/selectors';
import SubscribeVerificationNudge from './verificationNudge';

import './style.scss';

interface SubscribeModalProps {
	isOpen: boolean;
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
	trackScrollPage?: (
		path: string,
		title: string,
		category: string,
		readerView: string,
		pageNum: number
	) => void;
}

const TypedStream: ComponentType< StreamProps > = Stream as ComponentType< StreamProps >;

const SubscribeModal: React.FC< SubscribeModalProps > = ( { isOpen, onClose } ) => {
	const followedTags = useSelector( getReaderFollowedTags );

	const followedTagSlugs = useMemo( () => {
		return ( followedTags || [] ).map( ( tag ) => tag.slug );
	}, [ followedTags ] );

	const promptVerification = ! useSelector( isCurrentUserEmailVerified );

	const [ currentPage, setCurrentPage ] = useState( 0 );
	const [ selectedSite, setSelectedSite ] = useState< CardData | null >( null );
	const dispatch = useDispatch();
	const currentLocale = getLocaleSlug();
	const SITES_PER_PAGE = 6;
	const queryClient = useQueryClient();

	const { data: apiRecommendedSites = [], isLoading } = useQuery( {
		queryKey: [ 'reader-onboarding-recommended-sites', followedTagSlugs, currentLocale ],
		queryFn: () =>
			wpcom.req.get(
				{
					path: `/read/tags/cards`,
					apiNamespace: 'wpcom/v2',
				},
				{
					tags: followedTagSlugs,
					site_recs_per_card: 18,
					tag_recs_per_card: 0,
				}
			),
		refetchOnMount: 'always',
		refetchOnWindowFocus: true,
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

	// Prefetch all feed streams when the modal is opened.
	useEffect( () => {
		if ( isOpen && combinedRecommendations.length > 0 ) {
			combinedRecommendations.forEach( ( site ) => {
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				dispatch( requestPage( { streamKey: `feed:${ site.feed_ID }` } as any ) );
			} );
		}
	}, [ isOpen, combinedRecommendations, dispatch ] );

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

	const follows = useSelector( getReaderFollows );

	const handleFollowToggle = useCallback(
		async ( site: CardData, following: boolean ) => {
			const isFollowingSite = ( site: CardData ) =>
				follows.some(
					( follow ) => follow.feed_ID === site.feed_ID || follow.blog_ID === site.site_ID
				);

			// Exit early if the follow state already matches what we want.
			if ( following === isFollowingSite( site ) ) {
				return;
			}

			// Maximum number of retries
			const MAX_RETRIES = 3;

			for ( let attempt = 0; attempt < MAX_RETRIES; attempt++ ) {
				// Update the subscriptions list behind the modal.
				await dispatch( requestFollows() );

				// Delay the next attempt.
				await new Promise( ( resolve ) => setTimeout( resolve, 300 ) );

				if ( following === isFollowingSite( site ) ) {
					return;
				}
			}
		},
		[ follows, dispatch ]
	);

	const formatUrl = ( url: string ): string => {
		return url
			.replace( /^(https?:\/\/)?(www\.)?/, '' ) // Remove protocol and www
			.replace( /\/$/, '' ); // Remove trailing slash
	};

	const handleClose = useCallback( () => {
		dispatch( clearStream( { streamKey: 'following' } ) );
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		dispatch( requestPage( { streamKey: 'following' } as any ) );

		onClose();
	}, [ dispatch, onClose ] );

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
			} ) as AnyAction
		);

		handleClose();
	}, [ dispatch, handleClose, queryClient ] );

	const headerActions = (
		<>
			<Button onClick={ handleClose } variant="link">
				{ __( 'Cancel' ) }
			</Button>
			<Button onClick={ handleContinue } variant="primary" disabled={ promptVerification }>
				{ __( 'Continue' ) }
			</Button>
		</>
	);

	return (
		isOpen && (
			<Modal
				onRequestClose={ handleClose }
				isFullScreen
				className="subscribe-modal"
				headerActions={ headerActions }
				isDismissible={ false }
			>
				{ promptVerification && <SubscribeVerificationNudge /> }
				<div
					className={ clsx( 'subscribe-modal__content', {
						'subscribe-modal__disabled-for-verification': promptVerification,
					} ) }
				>
					<div className="subscribe-modal__site-list-column">
						<h2 className="subscribe-modal__title">{ __( "Discover sites that you'll love" ) }</h2>
						<p className="subscribe-modal__description">
							{ __(
								'Preview sites by clicking below, then subscribe to any site that inspires you.'
							) }
						</p>
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
										disableSuggestedFollows
										replaceStreamClickWithItemClick
										onItemClick={ () => handleItemClick( site ) }
										isSelected={ selectedSite?.feed_ID === site.feed_ID }
										onFollowToggle={ ( following: boolean ) =>
											handleFollowToggle( site, following )
										}
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
										<h3>{ formatUrl( selectedSite.site_URL ) }</h3>
									</div>
									<div className="subscribe-modal__preview-stream-container">
										<TypedStream
											streamKey={ `feed:${ selectedSite.feed_ID }` }
											className="is-site-stream subscribe-modal__preview-stream"
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
			</Modal>
		)
	);
};

export default SubscribeModal;
