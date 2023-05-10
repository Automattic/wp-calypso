import React from 'react';
import { Campaign } from 'calypso/data/promote-post/use-promote-post-campaigns-query';
import CampaignItem from '../campaign-item';
import './style.scss';

interface Props {
	campaigns: Campaign[];
	isLoading: boolean;
	isFetchingPageResults: boolean;
}

export const CampaignItemLoading = ( { totalRows = 7 }: { totalRows?: number } ) => {
	return (
		<tr>
			<td>
				<div className="promote-post-i2__campaign-item-wrapper">
					<div className="campaign-item__header-image-skeleton"></div>
					<div>
						<div className="campaign-item__skeleton-text" />
						<div className="campaign-item__skeleton-text campaign-item__skeleton-text2" />
					</div>
				</div>
			</td>
			{ [ ...Array( totalRows - 1 ) ].map( ( e, i ) => (
				<td key={ i }></td>
			) ) }
		</tr>
	);
};

export default function CampaignsTable( props: Props ) {
	const { campaigns, isLoading, isFetchingPageResults } = props;

	return (
		<div>
			<table className="promote-post-i2__table">
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
					{ isLoading && ! isFetchingPageResults ? (
						<>
							<CampaignItemLoading />
							<CampaignItemLoading />
							<CampaignItemLoading />
							<CampaignItemLoading />
							<CampaignItemLoading />
						</>
					) : (
						<>
							{ campaigns.map( ( campaign ) => {
								return (
									<CampaignItem
										key={ `campaign-id${ campaign.campaign_id }` }
										campaign={ campaign }
									/>
								);
							} ) }
							{ isFetchingPageResults && <CampaignItemLoading /> }
						</>
					) }
				</tbody>
			</table>
		</div>
	);
}
