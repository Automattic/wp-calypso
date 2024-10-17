import { LoadingPlaceholder } from '@automattic/components';
import { useQuery } from '@tanstack/react-query';
import { Modal, Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import React, { useMemo, useState, ComponentType } from 'react';
import { useSelector } from 'react-redux';
import ConnectedReaderSubscriptionListItem from 'calypso/blocks/reader-subscription-list-item/connected';
import wpcom from 'calypso/lib/wp';
import Stream from 'calypso/reader/stream';
import { getReaderFollowedTags } from 'calypso/state/reader/tags/selectors';
import { curatedBlogs } from '../curated-blogs';

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
	// Add other props as needed based on the Stream component's requirements
}

const TypedStream: ComponentType< StreamProps > = Stream as ComponentType< StreamProps >;

const SubscribeModal: React.FC< SubscribeModalProps > = ( { isOpen, onClose } ) => {
	const followedTags = useSelector( getReaderFollowedTags ) || [];
	const followedTagSlugs = followedTags.map( ( tag ) => tag.slug );

	const { data: apiRecommendedSites = [], isLoading } = useQuery( {
		queryKey: [ 'reader-onboarding-recommended-sites', followedTagSlugs ],
		queryFn: () =>
			wpcom.req.get(
				{
					path: `/read/tags/cards`,
					apiNamespace: 'wpcom/v2',
				},
				{
					tags: followedTagSlugs,
					site_recs_per_card: 6,
					tag_recs_per_card: 0,
				}
			),
		refetchOnMount: false,
		refetchOnWindowFocus: false,
		select: ( data: { cards: Card[] } ) => {
			const recommendedBlogsCard = data.cards.find(
				( card: Card ) => card.type === 'recommended_blogs'
			);

			return recommendedBlogsCard ? recommendedBlogsCard.data : [];
		},
	} );

	const combinedRecommendations = useMemo( () => {
		// Get list of curated recommendations.
		const curatedRecommendations = followedTagSlugs
			.flatMap( ( tag ) => curatedBlogs[ tag ] || [] )
			.map( ( blog ) => ( { ...blog, weight: 1, isCurated: true } ) );

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

		// Limit to 6 recommendations
		return sortedRecommendations.slice( 0, 6 );
	}, [ followedTagSlugs, apiRecommendedSites ] );

	const headerActions = (
		<>
			<Button onClick={ onClose } variant="link">
				{ __( 'Cancel' ) }
			</Button>
		</>
	);

	const [ selectedSite, setSelectedSite ] = useState< CardData | null >( null );

	const handleItemClick = ( site: CardData ) => {
		setSelectedSite( site );
	};

	return (
		isOpen && (
			<Modal
				onRequestClose={ onClose }
				isFullScreen
				className="subscribe-modal"
				headerActions={ headerActions }
				isDismissible={ false }
				isScrollable={ false }
			>
				<div className="subscribe-modal__content">
					<div className="subscribe-modal__site-list-column">
						<h2 className="subscribe-modal__title">{ __( "Discover sites that you'll love" ) }</h2>
						<p>
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
								{ combinedRecommendations.map( ( site: CardData ) => (
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
										onItemClick={ () => handleItemClick( site ) }
									/>
								) ) }
							</div>
						) }
						<p>{ __( 'Load more recommendations' ) }</p>
						<Button className="subscribe-modal__continue-button is-primary" onClick={ onClose }>
							{ __( 'Continue' ) }
						</Button>
					</div>
					<div className="subscribe-modal__preview-column">
						<div className="subscribe-modal__preview-placeholder">
							{ selectedSite ? (
								<div className="subscribe-modal__preview-stream-container">
									<TypedStream
										streamKey={ `feed:${ selectedSite.feed_ID }` }
										className="is-site-stream subscribe-modal__preview-stream"
										followSource="reader_subscribe_modal"
										useCompactCards
									/>
								</div>
							) : (
								<div className="subscribe-modal__preview-placeholder-text">
									{ __( 'Select a blog to preview its posts' ) }
								</div>
							) }
						</div>
					</div>
				</div>
			</Modal>
		)
	);
};

export default SubscribeModal;
