import { useNavigate, useLoaderData } from '@tanstack/react-router';
import { Button, Card } from '@wordpress/components';
import { DataViews, filterSortAndPaginate } from '@wordpress/dataviews';
import { useState, useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { Icon, check } from '@wordpress/icons';
import PageLayout from '../page-layout';
import type { Site } from '../data/types';
import type { View, Field } from '@wordpress/dataviews';

function Sites() {
	const navigate = useNavigate();
	const querySitesData = useLoaderData( { from: '/sites' } ) as Site[];
	const [ sites, setSites ] = useState< Site[] >( [] );
	useEffect( () => {
		if ( querySitesData ) {
			setSites( querySitesData );
		}
	}, [ querySitesData ] );

	// View config.
	const [ view, setView ] = useState< View >( {
		type: 'table',
		page: 1,
		perPage: 10,
		sort: {
			field: 'name',
			direction: 'desc',
		},
		fields: [ 'subscribers', 'backups', 'protect' ],
		titleField: 'name',
		mediaField: 'media',
		descriptionField: 'url',
	} );

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
		},
		{
			id: 'media',
			label: __( 'Media' ),
			render: ( { item } ) =>
				item?.media ? <img src={ item.media } alt={ item.name } width="100%" /> : null,
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
			render: ( { item } ) => {
				if ( item.backups === 'enabled' ) {
					return <Icon icon={ check } />;
				}

				return __( 'Disabled' );
			},
		},
		{
			id: 'protect',
			label: __( 'Protect' ),
			render: ( { item } ) => {
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
	] as Field< Site >[];

	const { data: filteredData, paginationInfo } = filterSortAndPaginate( sites, view, fields );

	const onClickItem = ( item: Site ) => {
		navigate( { to: `/sites/${ item.id }` } );
	};

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

	return (
		<PageLayout
			title={ __( 'Sites' ) }
			actions={
				<Button variant="primary" __next40pxDefaultSize>
					{ __( 'Add New Site' ) }
				</Button>
			}
		>
			<Card>
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
			</Card>
		</PageLayout>
	);
}

export default Sites;
