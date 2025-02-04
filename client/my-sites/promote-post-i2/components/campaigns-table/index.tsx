import { translate } from 'i18n-calypso';
import React from 'react';
import { Campaign } from 'calypso/data/promote-post/types';
import CampaignItem from '../campaign-item';
import './style.scss';

interface Props {
	campaigns: Campaign[];
	isLoading: boolean;
	isFetchingPageResults: boolean;
	isWooStore: boolean;
}

export const SingleItemLoading = ( { totalRows = 8 }: { totalRows?: number } ) => {
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

export const ItemsLoading = ( { totalRows = 8 }: { totalRows?: number } ) => {
	const rowsNumber = 5;
	return (
		<>
			{ new Array( rowsNumber ).fill( 0, 0, rowsNumber ).map( ( _, key ) => (
				<SingleItemLoading totalRows={ totalRows } key={ key } />
			) ) }
		</>
	);
};

export default function CampaignsTable( props: Props ) {
	const { campaigns, isLoading, isFetchingPageResults, isWooStore } = props;

	type CampaignColumn = {
		key: string;
		title: string;
	};

	const getHeaderColumns = (): CampaignColumn[] => {
		const columns: CampaignColumn[] = [
			{
				key: 'data',
				title: translate( 'Campaign' ),
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
				key: 'spend',
				title: translate( 'Spend' ),
			},
			{
				key: 'clicks',
				title: translate( 'Clicks' ),
			},
		];

		if ( isWooStore ) {
			columns.push( {
				key: 'conversion',
				title: translate( 'Conversion rate' ),
			} );
		}

		columns.push( {
			key: 'action',
			title: '',
		} );

		return columns;
	};

	return (
		<div>
			<table className="promote-post-i2__table campaigns-list__table">
				<thead>
					<tr>
						{ getHeaderColumns().map( ( item, key ) => (
							<th className={ `campaign-item__${ item.key }` } key={ key }>
								{ item.title }
							</th>
						) ) }
					</tr>
				</thead>
				<tbody>
					{ isLoading && ! isFetchingPageResults ? (
						<ItemsLoading />
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
							{ isFetchingPageResults && <SingleItemLoading /> }
						</>
					) }
				</tbody>
			</table>
		</div>
	);
}
