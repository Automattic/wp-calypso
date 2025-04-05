import {
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
	__experimentalHeading as Heading,
	ExternalLink,
	Card,
} from '@wordpress/components';
import { DataViews, View, filterSortAndPaginate } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { useState } from 'react';

const mockData = [
	{
		message: __( 'Jetpack was updated to version 12.3' ),
		date: 'Apr 5, 2025 14:23',
		source: 'Plugins',
	},
	{
		message: __( 'New post "Welcome to our site" was published' ),
		date: 'Apr 4, 2025 09:45',
		source: 'Posts',
	},
	{
		message: __( 'Theme was changed from Twenty Twenty-Three to Twenty Twenty-Four' ),
		date: 'Apr 3, 2025 16:32',
		source: 'Themes',
	},
	{
		message: __( 'New user "editor@example.com" was added with Editor role' ),
		date: 'Apr 2, 2025 11:05',
		source: 'Users',
	},
	{
		message: __( 'Contact Form 7 plugin was installed and activated' ),
		date: 'Apr 1, 2025 10:17',
		source: 'Plugins',
	},
];

const defaultView: View = {
	filters: [],
	page: 1,
	perPage: 10,
	search: '',
	type: 'table',
	titleField: 'message',
	fields: [ 'source' ],
};

const defaultLayouts = {
	table: {},
};

const fields = [
	{
		id: 'message',
		label: __( 'Message' ),
	},
	{
		id: 'date',
		label: __( 'Date' ),
	},
	{
		id: 'source',
		label: __( 'Source' ),
	},
];

/**
 * Activity Log component that displays recent site activities in a DataViews table.
 */
export default function ActivityLog() {
	const [ view, setView ] = useState( defaultView );
	const { data: filteredData, paginationInfo } = filterSortAndPaginate( mockData, view, fields );
	return (
		<Card>
			<VStack style={ { padding: '16px' } }>
				<HStack justify="space-between" style={ { marginBottom: '16px' } }>
					<Heading level={ 3 }>{ __( 'Activity log' ) }</Heading>
					<ExternalLink href="#">{ __( 'View all' ) }</ExternalLink>
				</HStack>
				<DataViews
					data={ filteredData || [] }
					fields={ fields }
					onChangeView={ ( newView ) => setView( () => newView ) }
					view={ view }
					actions={ [] }
					getItemId={ ( item ) => item.message }
					paginationInfo={ paginationInfo }
					isLoading={ false }
					defaultLayouts={ defaultLayouts }
				/>
			</VStack>
		</Card>
	);
}
