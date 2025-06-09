import useIsBrowser from '@docusaurus/useIsBrowser';
import { DataViews, filterSortAndPaginate, type Field, type View } from '@wordpress/dataviews';
import { useState } from 'react';
import { data, statuses, type ComponentData } from './data';
import { IconLink } from './icon-link';
import { StatusIndicator } from './status-indicator';
import styles from './wp-components-table.module.scss';

const FIELDS: Field< ComponentData >[] = [
	{
		id: 'status',
		label: 'Status',
		enableHiding: true,
		elements: statuses,
		render: ( { item } ) => {
			return <StatusIndicator status={ item.status } />;
		},
	},
	{
		id: 'name',
		label: 'Name',
		enableHiding: false,
		enableGlobalSearch: true,
	},
	{
		id: 'whereUsed',
		label: 'Where used',
		enableHiding: true,
		elements: [
			{ value: 'global', label: 'Global' },
			{ value: 'editor', label: 'Editor' },
		],
	},
	{
		id: 'docs',
		label: 'Docs',
		enableHiding: true,
		enableSorting: false,
		render: ( { item } ) => {
			return <IconLink href={ item.docs } type="storybook" />;
		},
	},
	{
		id: 'figma',
		label: 'Figma',
		enableHiding: true,
		enableSorting: false,
		render: ( { item } ) => {
			return item.figma && <IconLink href={ item.figma } type="figma" />;
		},
	},
	{
		id: 'notes',
		label: 'Notes',
		enableHiding: true,
		enableSorting: false,
		render: ( { item } ) => {
			return <div className={ styles[ 'wp-components-table-notes' ] }>{ item.notes }</div>;
		},
	},
];

export function WPComponentsTable() {
	const isBrowser = useIsBrowser();

	const [ view, setView ] = useState< View >( {
		type: 'table',
		page: 1,
		sort: {
			field: 'name',
			direction: 'asc',
		},
		titleField: 'name',
		fields: [ 'status', 'whereUsed', 'docs', 'figma', 'notes' ],
	} );

	// DataViews includes Emotion components, and thus cannot be rendered on the server.
	if ( ! isBrowser ) {
		return null;
	}

	const { data: filteredData, paginationInfo } = filterSortAndPaginate( data, view, FIELDS );

	return (
		<DataViews
			data={ filteredData ?? [] }
			fields={ FIELDS }
			view={ view }
			onChangeView={ setView }
			paginationInfo={ paginationInfo }
			defaultLayouts={ {} }
		/>
	);
}
