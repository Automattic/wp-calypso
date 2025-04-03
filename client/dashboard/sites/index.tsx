import { __experimentalHeading as Heading } from '@wordpress/components';
import { DataViews, filterSortAndPaginate } from '@wordpress/dataviews';
import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { SITE_DATA, Site } from '../data';
import type { View, Field } from '@wordpress/dataviews';

// Helper function to get color based on performance score
const getPerformanceColor = ( score ) => {
	if ( score >= 90 ) {
		return '#4CAF50';
	}
	if ( score >= 70 ) {
		return '#FFC107';
	}
	return '#F44336';
};

function Sites() {
	// View config.
	const [ view, setView ] = useState< View >( {
		type: 'table',
		page: 1,
		perPage: 10,
		sort: {
			field: 'title',
			direction: 'desc',
		},
		fields: [ 'visitors', 'performance', 'backups' ],
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
					<span>{ item.performance }%</span>
				</div>
			),
		},
		{
			id: 'backups',
			label: __( 'Backups' ),
			render: ( { item } ) => <span>{ item.backups ? 'Enabled' : 'Disabled' }</span>,
			elements: [
				{ value: true, label: 'Enabled' },
				{ value: false, label: 'Disabled' },
			],
		},
	] as Field< Site >[];

	const { data: filteredData, paginationInfo } = filterSortAndPaginate( SITE_DATA, view, fields );

	return (
		<>
			<Heading>{ __( 'Sites' ) }</Heading>
			<DataViews
				data={ filteredData }
				fields={ fields }
				view={ view }
				onChangeView={ setView }
				defaultLayouts={ { table: {} } }
				paginationInfo={ paginationInfo }
			/>
		</>
	);
}

export default Sites;
