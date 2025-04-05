import { Button, Card } from '@wordpress/components';
import { DataViews, filterSortAndPaginate } from '@wordpress/dataviews';
import { useState, useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useNavigate, useLoaderData } from 'react-router-dom';
import { type SiteObject } from '../data';
import PageLayout from '../page-layout';
import type { View, Field } from '@wordpress/dataviews';

// Helper function to get color based on performance score
// const getPerformanceColor = ( score: number ) => {
// 	if ( score >= 90 ) {
// 		return '#4CAF50';
// 	}
// 	if ( score >= 70 ) {
// 		return '#FFC107';
// 	}
// 	return '#F44336';
// };

function Sites() {
	const navigate = useNavigate();
	const querySitesData = useLoaderData() as SiteObject[];
	const [ sites, setSites ] = useState< SiteObject[] >( [] );
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
		descriptionField: 'URL',
	} );

	// Field definitions
	const fields = [
		{
			id: 'name',
			label: __( 'Site' ),
		},
		{
			id: 'URL',
			label: __( 'URL' ),
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
		// {
		// 	id: 'performance',
		// 	label: __( 'Performance Score' ),
		// 	render: ( { item } ) => (
		// 		<div style={ { display: 'flex', alignItems: 'center' } }>
		// 			<span
		// 				style={ {
		// 					backgroundColor: getPerformanceColor( item.performance ),
		// 					width: 12,
		// 					height: 12,
		// 					borderRadius: '50%',
		// 					display: 'inline-block',
		// 					marginRight: 8,
		// 				} }
		// 			></span>
		// 			<span>{ item.performance }</span>
		// 		</div>
		// 	),
		// },
		{
			id: 'backups',
			label: __( 'Backups' ),
			elements: [
				{ value: 'enabled', label: 'Enabled' },
				{ value: 'disabled', label: 'Disabled' },
			],
		},
		{
			id: 'protect',
			label: __( 'Protect' ),
			elements: [
				{ value: 'enabled', label: 'Enabled' },
				{ value: 'disabled', label: 'Disabled' },
			],
		},
	] as Field< SiteObject >[];

	const { data: filteredData, paginationInfo } = filterSortAndPaginate( sites, view, fields );

	const onClickItem = ( item: SiteObject ) => {
		navigate( `/sites/${ item.id }` );
	};

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
					view={ view }
					onChangeView={ setView }
					onClickItem={ onClickItem }
					defaultLayouts={ { table: {} } }
					paginationInfo={ paginationInfo }
					search={ false }
				/>
			</Card>
		</PageLayout>
	);
}

export default Sites;
