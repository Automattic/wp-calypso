import { LoadingPlaceholder } from '@automattic/components';
import { useQuery } from '@tanstack/react-query';
import { Modal } from '@wordpress/components';
import React from 'react';
import { useSelector } from 'react-redux';
import ConnectedReaderSubscriptionListItem from 'calypso/blocks/reader-subscription-list-item/connected';
import wpcom from 'calypso/lib/wp';
import { getReaderFollowedTags } from 'calypso/state/reader/tags/selectors';

interface SubscribeModalProps {
	isOpen: boolean;
	onClose: () => void;
}

interface CardData {
	ID: number;
	site_ID: number;
	feed_ID: number;
	site_URL: string;
	site_name: string;
}

interface Card {
	type: string;
	data: CardData;
}

const SubscribeModal: React.FC< SubscribeModalProps > = ( { isOpen, onClose } ) => {
	const followedTags = useSelector( getReaderFollowedTags ) || [];
	const followedTagSlugs = followedTags.map( ( tag ) => tag.slug );
	followedTagSlugs.sort();

	const { data: recommendedSites = [], isLoading } = useQuery( {
		queryKey: [ 'reader-onboarding-recommended-sites', followedTagSlugs ],
		queryFn: () =>
			wpcom.req.get(
				{
					path: `/read/tags/cards`,
					apiNamespace: 'wpcom/v2',
				},
				{
					tags: followedTagSlugs,
				}
			),
		refetchOnMount: false,
		refetchOnWindowFocus: false,
		select: ( data ) => {
			// Extract all sites from the cards array
			return data.cards.flatMap( ( card: Card ): CardData | [] => {
				if ( card.type !== 'post' || typeof card.data !== 'object' ) {
					return [];
				}

				return card.data;
			} );
		},
	} );

	return (
		isOpen && (
			<Modal title="Discover and Subscribe" onRequestClose={ onClose } isFullScreen>
				<h2>Suggested blogs based on your interests</h2>
				{ isLoading && <LoadingPlaceholder /> }
				{ ! isLoading && recommendedSites.length === 0 && (
					<p>No recommendations available at the moment.</p>
				) }
				{ ! isLoading && recommendedSites.length > 0 && (
					<div className="subscribe-modal__recommended-sites">
						{ recommendedSites.map( ( site: CardData ) => (
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
							/>
						) ) }
					</div>
				) }
			</Modal>
		)
	);
};

export default SubscribeModal;
