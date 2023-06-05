import { translate } from 'i18n-calypso';
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

	type CampaignItem = {
		key: string;
		title: string;
	};
	const columns: CampaignItem[] = [
		{
			key: 'title',
			title: translate( 'Campaign' ),
		},
		{
			key: 'user',
			title: translate( 'User' ),
		},
		{
			key: 'status',
			title: translate( 'Status' ),
		},
		{
			key: 'ends',
			title: translate( 'Ends' ),
		},
		{
			key: 'budget',
			title: translate( 'Budget' ),
		},
		{
			key: 'impressions',
			title: translate( 'Impressions' ),
		},
		{
			key: 'clicks',
			title: translate( 'Clicks' ),
		},
		{
			key: 'action',
			title: '',
		},
	];

	return (
		<div>
			<table className="promote-post-i2__table campaigns-list__table">
				<thead>
					<tr>
						{ columns.map( ( item, key ) => (
							<th className={ `campaign-item__${ item.key }` } key={ key }>
								{ item.title }
							</th>
						) ) }
					</tr>
				</thead>
				<tbody>
					{ isLoading && ! isFetchingPageResults ? (
						<>
							{ columns.map( ( item, key ) => (
								<CampaignItemLoading key={ key } />
							) ) }
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
