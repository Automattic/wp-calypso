import { Badge } from '@automattic/components';
import {
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
	__experimentalHeading as Heading,
	Card,
} from '@wordpress/components';
import { DataViews, View, filterSortAndPaginate } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { useState } from 'react';

const mockData = [
	{
		id: 'deploy-1234',
		message: __( 'Updated homepage hero section' ),
		status: 'success',
		date: 'Apr 5, 2025 16:45',
	},
	{
		id: 'deploy-1233',
		message: __( 'Fixed contact form not sending emails' ),
		status: 'in-progress',
		date: 'Apr 4, 2025 10:20',
	},
	{
		id: 'deploy-1232',
		message: __( 'Initial site deployment' ),
		status: 'failed',
		date: 'Apr 3, 2025 08:15',
	},
	{
		id: 'deploy-1231',
		message: __( 'Security patch for user authentication' ),
		status: 'success',
		date: 'Apr 2, 2025 14:30',
	},
	{
		id: 'deploy-1230',
		message: __( 'Added newsletter signup functionality' ),
		status: 'success',
		date: 'Apr 1, 2025 11:05',
	},
];

type Deployment = {
	id: string;
	message: string;
	status: 'success' | 'in-progress' | 'failed';
	date: string;
};

const defaultView: View = {
	filters: [],
	page: 1,
	perPage: 10,
	search: '',
	type: 'table',
	titleField: 'id',
	fields: [ 'status', 'message' ],
};

const defaultLayouts = {
	table: {},
};

const getDeploymentId = ( item: any ) => item.id || '';

/**
 * Deployments component that displays site deployment history in a DataViews table.
 */
export default function Deployments() {
	const [ view, setView ] = useState( defaultView );
	const fields = [
		{
			id: 'id',
			label: __( 'ID' ),
		},
		{
			id: 'message',
			label: __( 'Message' ),
		},
		{
			id: 'status',
			label: __( 'Status' ),
			render: ( { item }: { item: Deployment } ) => {
				const status = item.status;
				let color;
				let label;

				switch ( status ) {
					case 'success':
						color = 'success';
						label = __( 'Success' );
						break;
					case 'in-progress':
						color = 'warning';
						label = __( 'In progress' );
						break;
					case 'failed':
						color = 'error';
						label = __( 'Failed' );
						break;
					default:
						color = 'info';
						label = status;
				}

				return <Badge variant={ color }>{ label }</Badge>;
			},
		},
		{
			id: 'date',
			label: __( 'Date' ),
		},
	];

	const { data: filteredData, paginationInfo } = filterSortAndPaginate( mockData, view, fields );

	return (
		<Card>
			<VStack style={ { padding: '16px' } }>
				<HStack justify="space-between" style={ { marginBottom: '16px' } }>
					<Heading level={ 3 }>{ __( 'Deployments' ) }</Heading>
				</HStack>
				<DataViews
					data={ filteredData || [] }
					fields={ fields }
					onChangeView={ ( newView ) => setView( () => newView ) }
					view={ view }
					actions={ [] }
					search
					paginationInfo={ paginationInfo }
					getItemId={ getDeploymentId }
					isLoading={ false }
					defaultLayouts={ defaultLayouts }
				/>
			</VStack>
		</Card>
	);
}
