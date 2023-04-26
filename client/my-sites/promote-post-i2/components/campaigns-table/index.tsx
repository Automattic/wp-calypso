import { Campaign } from 'calypso/data/promote-post/use-promote-post-campaigns-query';
import CampaignItem from '../campaign-item';

import './style.scss';

interface Props {
	campaigns: Campaign[];
}

export default function CampaignsTable( props: Props ) {
	const { campaigns } = props;
	return (
		<div>
			<table className="promote-post__table">
				<thead>
					<tr>
						<th key="campaign">Campaign</th>
						<th key="user">User</th>
						<th key="status">Status</th>
						<th key="ends">Ends</th>
						<th key="budget">Budget</th>
						<th key="impressions">Impressions</th>
						<th key="clicks">Clicks</th>
					</tr>
				</thead>
				<tbody>
					{ campaigns.map( ( campaign ) => {
						return <CampaignItem key={ `item-${ campaign.campaign_id }` } campaign={ campaign } />;
					} ) }
				</tbody>
			</table>
		</div>
	);
}
