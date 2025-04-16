import { useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@wordpress/components';
import { DataViews, filterSortAndPaginate } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { Icon, check } from '@wordpress/icons';
import { useState } from 'react';
import { sitesQuery } from '../app/queries';
import DataViewsCard from '../dataviews-card';
import PageLayout from '../page-layout';
import SiteIcon from '../site-icon';
import type { Site } from '../data/types';
import type { View } from '@wordpress/dataviews';

const actions = [
	{
		id: 'admin',
		isPrimary: true,
		label: __( 'WP Admin' ),
		callback: ( sites: Site[] ) => {
			const site = sites[ 0 ];
			window.location.href = site.options?.admin_url ?? '';
		},
		isEligible: ( item: Site ) => ( item.is_deleted ? false : true ),
	},
];

// Field definitions
const fields = [
	{
		id: 'name',
		label: __( 'Site' ),
		enableGlobalSearch: true,
	},
	{
		id: 'url',
		label: __( 'URL' ),
		enableGlobalSearch: true,
		render: ( { item }: { item: Site } ) => new URL( item.url ).hostname,
	},
	{
		id: 'media',
		label: __( 'Media' ),
		render: ( { item }: { item: Site } ) => <SiteIcon site={ item } />,
	},
	{
		id: 'subscribers',
		label: __( 'Subscribers' ),
	},
	{
		id: 'backups',
		label: __( 'Backups' ),
		elements: [
			{ value: 'enabled', label: __( 'Enabled' ) },
			{ value: 'disabled', label: __( 'Disabled' ) },
		],
		render: ( { item }: { item: Site } ) => {
			if ( item.backups === 'enabled' ) {
				return <Icon icon={ check } />;
			}

			return __( 'Disabled' );
		},
	},
	{
		id: 'protect',
		label: __( 'Protect' ),
		render: ( { item }: { item: Site } ) => {
			if ( item.protect === 'enabled' ) {
				return <Icon icon={ check } />;
			}

			return __( 'Disabled' );
		},
		elements: [
			{ value: 'enabled', label: __( 'Enabled' ) },
			{ value: 'disabled', label: __( 'Disabled' ) },
		],
	},
];

export default function Sites() {
	const navigate = useNavigate();
	const sites = useQuery( sitesQuery() ).data;

	// View config.
	const [ view, setView ] = useState< View >( {
		type: 'table',
		page: 1,
		perPage: 10,
		sort: {
			field: 'name',
			direction: 'asc',
		},
		fields: [ 'subscribers', 'backups', 'protect' ],
		titleField: 'name',
		mediaField: 'media',
		descriptionField: 'url',
	} );

	if ( ! sites ) {
		return;
	}

	const { data: filteredData, paginationInfo } = filterSortAndPaginate( sites, view, fields );

	const onClickItem = ( item: Site ) => {
		navigate( { to: `/sites/${ item.id }` } );
	};

	return (
		<>
			<PageLayout
				title={ __( 'Sites' ) }
				actions={
					<Button variant="primary" __next40pxDefaultSize>
						{ __( 'Add New Site' ) }
					</Button>
				}
			>
				<DataViewsCard>
					<DataViews
						data={ filteredData }
						fields={ fields }
						actions={ actions }
						view={ view }
						onChangeView={ setView }
						onClickItem={ onClickItem }
						defaultLayouts={ { table: {} } }
						paginationInfo={ paginationInfo }
					/>
				</DataViewsCard>
			</PageLayout>
		</>
	);
}
