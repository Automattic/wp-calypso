import { Button, Card } from '@wordpress/components';
import { DataViews, filterSortAndPaginate } from '@wordpress/dataviews';
import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useNavigate, useLoaderData } from 'react-router-dom';
import { Site } from '../data';
import { fetchSites } from '../data/index';
import PageLayout from '../page-layout';
import type { View, Field } from '@wordpress/dataviews';
import type { LoaderFunction } from 'react-router-dom';

// Helper function to get color based on performance score
const getPerformanceColor = ( score: number ) => {
	if ( score >= 90 ) {
		return '#4CAF50';
	}
	if ( score >= 70 ) {
		return '#FFC107';
	}
	return '#F44336';
};

function Sites() {
	const navigate = useNavigate();

	// View config.
	const [ view, setView ] = useState< View >( {
		type: 'table',
		page: 1,
		perPage: 10,
		sort: {
			field: 'title',
			direction: 'desc',
		},
		fields: [ 'visitors', 'performance', 'backups', 'protect' ],
		titleField: 'title',
		descriptionField: 'url',
	} );

	// Field definitions
	const fields = [
		{
			id: 'title',
			label: __( 'Site' ),
			enableGlobalSearch: true,
		},
		{
			id: 'url',
			label: __( 'URL' ),
			enableGlobalSearch: true,
		},
		{
			id: 'visitors',
			label: __( 'Visitors' ),
		},
		{
			id: 'performance',
			label: __( 'Performance Score' ),
			render: ( { item } ) => (
				<div style={ { display: 'flex', alignItems: 'center' } }>
					<span
						style={ {
							backgroundColor: getPerformanceColor( item.performance ),
							width: 12,
							height: 12,
							borderRadius: '50%',
							display: 'inline-block',
							marginRight: 8,
						} }
					></span>
					<span>{ item.performance }</span>
				</div>
			),
		},
		{
			id: 'backups',
			label: __( 'Backups' ),
			getValue: ( { item } ) => ( item.backups ? 'enabled' : 'disabled' ),
			elements: [
				{ value: 'enabled', label: 'Enabled' },
				{ value: 'disabled', label: 'Disabled' },
			],
		},
		{
			id: 'protect',
			label: __( 'Protect' ),
			getValue: ( { item } ) => ( item.protect ? 'enabled' : 'disabled' ),
			elements: [
				{ value: 'enabled', label: 'Enabled' },
				{ value: 'disabled', label: 'Disabled' },
			],
		},
	] as Field< Site >[];

	const sites = useLoaderData() as Site[];
	const { data: filteredData, paginationInfo } = filterSortAndPaginate( sites, view, fields );

	const onClickItem = ( item: Site ) => {
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
				/>
			</Card>
		</PageLayout>
	);
}

Sites.loader = fetchSites satisfies LoaderFunction;

export default Sites;
