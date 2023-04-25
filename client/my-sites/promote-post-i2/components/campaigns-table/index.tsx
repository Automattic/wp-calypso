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
						<th>Campaign</th>
						<th>User</th>
						<th>Status</th>
						<th>Ends</th>
						<th>Budget</th>
						<th>Impressions</th>
						<th>Clicks</th>
					</tr>
				</thead>
				<tbody>
					{ campaigns.map( ( campaign ) => {
						return <CampaignItem campaign={ campaign } />;
					} ) }
				</tbody>
			</table>
		</div>
	);
}
