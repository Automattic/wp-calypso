import { useMemo } from 'react';
import ListEnd from 'calypso/components/list-end';
import { LoadingEllipsis } from 'calypso/components/loading-ellipsis';
import { Campaign } from 'calypso/data/promote-post/use-promote-post-campaigns-query';
import CampaignItem from 'calypso/my-sites/promote-post/components/campaign-item';
import './style.scss';
import CampaignsEmpty from 'calypso/my-sites/promote-post/components/campaigns-empty';
import EmptyPromotionList from '../empty-promotion-list';

export default function CampaignsList( {
	isLoading,
	campaigns,
}: {
	isLoading: boolean;
	campaigns: Campaign[];
} ) {
	const memoCampaigns = useMemo< Campaign[] >( () => campaigns || [], [ campaigns ] );

	const isEmpty = ! memoCampaigns.length;

	if ( isLoading ) {
		return (
			<div className="campaigns-list__loading-container">
				<LoadingEllipsis />
			</div>
		);
	}

	if ( ! memoCampaigns.length ) {
		return <EmptyPromotionList type="campaigns" />;
	}

	return (
		<>
			{ isEmpty && <CampaignsEmpty /> }
			{ ! isEmpty && (
				<>
					{ memoCampaigns.map( function ( campaign ) {
						return <CampaignItem key={ campaign.campaign_id } campaign={ campaign } />;
					} ) }
					<ListEnd />
				</>
			) }
		</>
	);
}
