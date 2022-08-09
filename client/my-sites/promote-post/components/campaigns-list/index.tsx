import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import ListEnd from 'calypso/components/list-end';
import { LoadingEllipsis } from 'calypso/components/loading-ellipsis';
import useCampaignsQuery, {
	Campaign,
	CampaignStatus,
} from 'calypso/data/promote-post/use-promote-post-campaigns-query';
import CampaignItem from 'calypso/my-sites/promote-post/components/campaign-item';
import './style.scss';
import CampaignsEmpty from 'calypso/my-sites/promote-post/components/campaigns-empty';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

// todo: use actual value
export const SmartStatuses: { [ status in CampaignStatus ]: string } = {
	'-1': 'All',
	0: 'pending',
	1: 'active',
	2: 'todo',
};

export default function CampaignsList() {
	const selectedSiteId = useSelector( getSelectedSiteId );
	const { isLoading, data } = useCampaignsQuery( selectedSiteId ?? 0 );
	const campaigns = useMemo< Campaign[] >( () => data || [], [ data ] );

	const isEmpty = ! campaigns.length;

	if ( isLoading ) {
		return (
			<div className="campaigns-list__loading-container">
				<LoadingEllipsis />
			</div>
		);
	}

	return (
		<>
			{ isEmpty && <CampaignsEmpty /> }
			{ ! isEmpty && (
				<>
					{ campaigns.map( function ( campaign ) {
						return <CampaignItem key={ campaign.campaign_id } campaign={ campaign } />;
					} ) }
					<ListEnd />
				</>
			) }
		</>
	);
}
