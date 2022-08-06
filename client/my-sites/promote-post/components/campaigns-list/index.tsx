import { Button } from '@automattic/components';
import { translate } from 'i18n-calypso';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import megaphoneIllustration from 'calypso/assets/images/customer-home/illustration--megaphone.svg';
import EmptyContent from 'calypso/components/empty-content';
import ListEnd from 'calypso/components/list-end';
import { LoadingEllipsis } from 'calypso/components/loading-ellipsis';
import SectionHeader from 'calypso/components/section-header';
import useCampaignsQuery, {
	Campaign,
	CampaignStatus,
} from 'calypso/data/promote-post/use-promote-post-campaigns-query';
import CampaignItem from 'calypso/my-sites/promote-post/components/campaign-item';
import './style.scss';
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
			{ isEmpty && (
				<EmptyContent
					title={ translate( 'No promoted posts' ) }
					line={ 'attributes.line' }
					action={ 'attributes.action' }
					actionURL={ 'attributes.actionURL' }
					// actionHoverCallback={ preloadEditor }
					illustration={ megaphoneIllustration }
					illustrationWidth={ 150 }
				/>
			) }
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
