import useIsBrowser from '@docusaurus/useIsBrowser';
import { useState, useEffect } from 'react';
import { data, statuses, type ComponentData } from './data';
import { IconLink } from './icon-link';
import { StatusIndicator } from './status-indicator';
import styles from './wp-components-table.module.scss';
import type { Field, View } from '@wordpress/dataviews';

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
	const [ DataViewsComponent, setDataViewsComponent ] = useState< any >( null );
	const [ filterSortAndPaginateFn, setFilterSortAndPaginateFn ] = useState< any >( null );

	const [ view, setView ] = useState< View >( {
		type: 'table',
		page: 1,
		sort: {
			field: 'name',
			direction: 'asc',
		},
		titleField: 'name',
		fields: [ 'status', 'whereUsed', 'docs', 'notes' ],
	} );

	useEffect( () => {
		// DataViews includes Emotion components, and thus cannot be rendered on the server.
		// Dynamically import it only on the client side.
		if ( isBrowser ) {
			import( '@wordpress/dataviews' ).then( ( module ) => {
				setDataViewsComponent( () => module.DataViews );
				setFilterSortAndPaginateFn( () => module.filterSortAndPaginate );
			} );
		}
	}, [ isBrowser ] );

	if ( ! isBrowser || ! DataViewsComponent || ! filterSortAndPaginateFn ) {
		return null;
	}

	const { data: filteredData, paginationInfo } = filterSortAndPaginateFn( data, view, FIELDS );

	return (
		<DataViewsComponent
			data={ filteredData ?? [] }
			fields={ FIELDS }
			view={ view }
			onChangeView={ setView }
			paginationInfo={ paginationInfo }
			defaultLayouts={ {} }
		/>
	);
}
