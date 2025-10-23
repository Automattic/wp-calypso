import { DataViews, Field, View, filterSortAndPaginate, type Action } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { useMemo, useState } from 'react';
import { DataViewsCard } from '../../../components/dataviews-card';
import SiteIcon from '../../../components/site-icon';
import { Name, URL, SiteLink } from '../../../sites/site-fields';
import { getSiteDisplayName } from '../../../utils/site-name';
import { getSiteDisplayUrl } from '../../../utils/site-url';
import { useEligibleSites } from '../hooks/use-eligible-sites';
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
		render: ( { item } ) => <SiteIcon site={ item } />,
		enableSorting: false,
		enableGlobalSearch: false,
	},
];

const defaultView: View = {
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

function ScheduledUpdatesSitesSelection( { selection, onChangeSelection }: Props ) {
	const { data: sites = [], isLoading } = useEligibleSites();
	const [ view, setView ] = useState< View >( defaultView );
	const { data: filtered, paginationInfo } = useMemo( () => {
		return filterSortAndPaginate( sites, view, siteFields );
	}, [ sites, view ] );

	const actions: Array< Action< Site > > = useMemo(
		() => [
			{
				id: 'bulk-select-sites',
				label: __( 'Select' ),
				supportsBulk: true,
				callback: ( items: Site[] ) =>
					onChangeSelection( items.map( ( item ) => String( item.ID ) ) ),
			},
		],
		[ onChangeSelection ]
	);

	return (
		<DataViewsCard>
			<DataViews< Site >
				data={ filtered }
				fields={ siteFields }
				view={ view }
				onChangeView={ setView }
				selection={ selection }
				onChangeSelection={ ( ids ) => onChangeSelection( ids as string[] ) }
				getItemId={ ( item: Site ) => String( item.ID ) }
				actions={ actions }
				isLoading={ isLoading }
				defaultLayouts={ {
					table: {
						showMedia: true,
						mediaField: 'icon.ico',
						titleField: 'name',
						descriptionField: 'url',
					},
				} }
				paginationInfo={ paginationInfo }
				renderItemLink={ ( { item, ...props } ) => <SiteLink { ...props } site={ item } /> }
			/>
		</DataViewsCard>
	);
}

export default ScheduledUpdatesSitesSelection;
