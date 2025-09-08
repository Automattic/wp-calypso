import { Card, CardBody, CardHeader } from '@wordpress/components';
import { DataViews, Field, View, filterSortAndPaginate, type Action } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { useMemo, useState } from 'react';
import { DataViewsCard } from '../../../../../components/dataviews-card';
import { Name, URL, SiteIconLink } from '../../../../../sites/site-fields';
import { getSiteDisplayName } from '../../../../../utils/site-name';
import { getSiteDisplayUrl } from '../../../../../utils/site-url';
import { useEligibleSites } from '../../../hooks/use-eligible-sites';
import type { Site } from '@automattic/api-core';

const siteFields: Field< Site >[] = [
	{
		id: 'name',
		label: __( 'Site' ),
		enableGlobalSearch: true,
		getValue: ( { item } ) => getSiteDisplayName( item ),
		render: ( { field, item } ) => <Name site={ item } value={ field.getValue( { item } ) } />,
	},
	{
		id: 'url',
		label: __( 'URL' ),
		enableGlobalSearch: true,
		getValue: ( { item } ) => getSiteDisplayUrl( item ),
		render: ( { field, item } ) => <URL site={ item } value={ field.getValue( { item } ) } />,
	},
	{
		id: 'icon.ico',
		label: __( 'Site icon' ),
		render: ( { item } ) => <SiteIconLink site={ item } />,
		enableSorting: false,
		enableGlobalSearch: false,
	},
];

// Strongly-typed bulk actions to enable selection UI, no actions column displayed via CSS
const actions: Array< Action< Site > > = [
	{
		id: 'bulk-select-sites',
		label: __( 'Select' ),
		supportsBulk: true,
		callback: () => {},
	},
];

const DEFAULT_VIEW: View = {
	type: 'table',
	page: 1,
	perPage: 5,
	sort: { field: 'name', direction: 'asc' },
	fields: [],
	titleField: 'name',
	descriptionField: 'url',
	mediaField: 'icon.ico',
	showMedia: true,
};

type Props = {
	selection: string[];
	onChangeSelection: ( ids: string[] ) => void;
};

export function PluginsScheduleNewSites( { selection, onChangeSelection }: Props ) {
	const { data: sites = [] } = useEligibleSites();
	const [ view, setView ] = useState< View >( DEFAULT_VIEW );
	const { data: filtered, paginationInfo } = useMemo( () => {
		return filterSortAndPaginate( sites as Site[], view, siteFields );
	}, [ sites, view ] );

	return (
		<Card>
			<CardHeader>
				<strong>{ __( 'Select sites' ) }</strong>
			</CardHeader>
			<CardBody>
				<DataViewsCard>
					<div className="plugins-schedule-new">
						<DataViews< Site >
							data={ filtered }
							fields={ siteFields }
							view={ view }
							onChangeView={ setView }
							selection={ selection }
							onChangeSelection={ ( ids ) => onChangeSelection( ids as string[] ) }
							getItemId={ ( item: Site ) => String( item.ID ) }
							actions={ actions }
							defaultLayouts={ {
								table: {
									showMedia: true,
									mediaField: 'icon.ico',
									titleField: 'name',
									descriptionField: 'url',
								},
							} }
							paginationInfo={ paginationInfo }
						/>
					</div>
				</DataViewsCard>
			</CardBody>
		</Card>
	);
}
