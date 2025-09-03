import { sitesQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { __experimentalVStack as VStack, SearchControl } from '@wordpress/components';
import { DataViews } from '@wordpress/dataviews';
import { useMemo, useState, useEffect, useCallback } from 'react';
import type { Site } from '@automattic/api-core';
import type { View } from '@wordpress/dataviews';

interface Props {
	onSiteSelect: ( site: Site ) => void;
}

export function SelectSite( { onSiteSelect }: Props ) {
	const { data: sites = [], isLoading } = useQuery( sitesQuery() );
	const perPage = 5;
	const [ view, setView ] = useState< View >( {
		type: 'list',
		perPage,
		page: 1,
		search: '',
		fields: [ 'name', 'URL' ],
		infiniteScrollEnabled: true,
	} );
	// Custom pagination handler that simulates server-side pagination
	const [ allLoadedRecords, setAllLoadedRecords ] = useState< Site[] >( [] );
	const [ selection, setSelection ] = useState< string[] >( [] );
	const totalPages = Math.ceil( sites.length / perPage );
	const currentPage = view.page || 1;

	// Handle selection changes
	const handleSelectionChange = useCallback(
		( newSelection: string[] ) => {
			setSelection( newSelection );

			// Get selected site objects
			const selectedSite = sites.find( ( site ) =>
				newSelection.includes( site.ID?.toString() ?? '' )
			);

			selectedSite && onSiteSelect( selectedSite );
		},
		[ sites, onSiteSelect ]
	);

	const fields = [
		{
			id: 'name',
			label: 'Site Name',
			render: ( { item }: { item: Site } ) => item.name,
		},
		{
			id: 'URL',
			label: 'URL',
			render: ( { item }: { item: Site } ) => {
				return <div>{ item.URL }</div>;
			},
		},
	];

	const infiniteScrollHandler = useCallback( () => {
		if ( currentPage >= totalPages ) {
			return;
		}

		setView( {
			...view,
			page: currentPage + 1,
		} );
	}, [ currentPage, totalPages, view ] );

	// Filter and slice data based on search and pagination
	const displayedData = useMemo( () => {
		let filteredSites = sites;

		// Apply search filter
		if ( view.search ) {
			const searchTerm = view.search.toLowerCase();
			filteredSites = sites.filter( ( site ) => site.name?.toLowerCase().includes( searchTerm ) );
		}

		// Apply pagination (infinite scroll)
		const endIndex = currentPage * perPage;
		return filteredSites.slice( 0, endIndex );
	}, [ sites, currentPage, perPage, view.search ] );

	// Update displayed data when page changes
	useEffect( () => {
		setAllLoadedRecords( displayedData );
	}, [ displayedData ] );

	const paginationInfo = {
		totalItems: sites.length,
		totalPages: Math.ceil( sites.length / perPage ),
		infiniteScrollHandler: infiniteScrollHandler,
	};

	if ( isLoading ) {
		return <div>Loading sites...</div>;
	}

	return (
		<div>
			<VStack spacing={ 4 }>
				<SearchControl
					size="compact"
					value={ view.search }
					onChange={ ( search ) => setView( { ...view, search } ) }
				/>
				<div style={ { maxHeight: '400px', overflow: 'auto' } }>
					<DataViews
						data={ allLoadedRecords }
						fields={ fields }
						view={ view }
						search
						paginationInfo={ paginationInfo }
						getItemId={ ( site: Site ) => site.ID?.toString() ?? '' }
						defaultLayouts={ { list: {} } }
						onChangeView={ setView }
						selection={ selection }
						onChangeSelection={ handleSelectionChange }
					>
						<DataViews.Layout />
					</DataViews>
				</div>
			</VStack>
		</div>
	);
}
