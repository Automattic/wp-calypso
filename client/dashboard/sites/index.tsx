import { __experimentalHeading as Heading } from '@wordpress/components';
import { DataViews } from '@wordpress/dataviews';
import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

const siteData = [
	{
		id: '1',
		title: 'My Blog',
		url: 'https://myblog.com',
		visitors: 2547,
		performance: 92,
		backups: true,
	},
	{
		id: '2',
		title: 'Business Site',
		url: 'https://mybusiness.com',
		visitors: 5324,
		performance: 87,
		backups: true,
	},
	{
		id: '3',
		title: 'Portfolio',
		url: 'https://myportfolio.com',
		visitors: 1867,
		performance: 95,
		backups: false,
	},
];

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
	const [ view, setView ] = useState( {
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
		},
		{
			id: 'url',
			label: __( 'URL' ),
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
			filterBy: {
				operators: [ 'is', 'isNot' ],
			},
		},
	];

	// Default layouts
	const defaultLayouts = {
		table: {
			mediaField: 'site',
			titleField: 'site',
		},
	};

	return (
		<>
			<Heading>{ __( 'Sites' ) }</Heading>
			<DataViews
				data={ siteData }
				fields={ fields }
				view={ view }
				onChangeView={ setView }
				defaultLayouts={ defaultLayouts }
				paginationInfo={ {
					totalItems: siteData.length,
					totalPages: Math.ceil( siteData.length / 10 ),
				} }
			/>
		</>
	);
}

export default Sites;
