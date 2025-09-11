import { sitesQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import {
	SearchControl,
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
} from '@wordpress/components';
import { DataViews } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { useMemo, useState, useCallback, useRef } from 'react';
import { canManageSite } from '../../sites/features';
import SiteIcon from '../../sites/site-icon';
import { getSiteDisplayUrl } from '../../utils/site-url';
import type { Site } from '@automattic/api-core';
import type { View } from '@wordpress/dataviews';
import './select-site.scss';

interface Props {
	attachedSiteId?: number;
	onSiteSelect: ( site: Site ) => void;
}

export function SelectSite( { attachedSiteId, onSiteSelect }: Props ) {
	const { data: allSites = [], isLoading } = useQuery( sitesQuery() );
	const sites = useMemo(
		() => allSites.filter( ( site ) => canManageSite( site ) && site.ID !== attachedSiteId ),
		[ allSites, attachedSiteId ]
	);
	const searchInputRef = useRef< HTMLInputElement >( null );

	const perPage = 6;
	const [ view, setView ] = useState< View >( {
		type: 'list',
		perPage,
		page: 1,
		search: '',
		fields: [ 'URL' ],
		titleField: 'name',
		mediaField: 'icon',
		infiniteScrollEnabled: true,
	} );

	const [ selection, setSelection ] = useState< string[] >( [] );
	const totalPages = Math.ceil( sites.length / perPage );
	const currentPage = view.page || 1;

	// Handle selection changes
	const handleSelectionChange = useCallback(
		( newSelection: string[] ) => {
			setSelection( newSelection );

			// Get selected site object
			const selectedSite = sites.find( ( site ) =>
				newSelection.includes( site.ID?.toString() ?? '' )
			);

			selectedSite && onSiteSelect( selectedSite );
		},
		[ sites, onSiteSelect ]
	);

	const fields = [
		{
			id: 'icon',
			render: ( { item }: { item: Site } ) => <SiteIcon site={ item } size={ 52 } />,
		},
		{
			id: 'name',
			label: 'Site Name',
			render: ( { item }: { item: Site } ) => item.name,
		},
		{
			id: 'URL',
			label: 'URL',
			getValue: ( { item }: { item: Site } ) => getSiteDisplayUrl( item ),
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

	const paginationInfo = {
		totalItems: displayedData.length,
		totalPages: Math.ceil( displayedData.length / perPage ),
		infiniteScrollHandler: infiniteScrollHandler,
	};

	const getEmptyStateMessage = () => {
		if ( isLoading ) {
			return __( 'Loading sites…' );
		}
		if ( view.search ) {
			return __( 'No sites found' );
		}
		return __( 'No sites' );
	};

	return (
		<div className="domain-transfer-select-site">
			<VStack spacing={ 4 }>
				<HStack>
					<SearchControl
						ref={ searchInputRef }
						size="compact"
						value={ view.search }
						onChange={ ( search ) => {
							setView( { ...view, search } );
							setSelection( [] );
							// Keep focus on search input after filtering
							setTimeout( () => searchInputRef.current?.focus(), 0 );
						} }
					/>
				</HStack>
				<DataViews
					data={ displayedData }
					fields={ fields }
					view={ view }
					paginationInfo={ paginationInfo }
					getItemId={ ( site: Site ) => site.ID.toString() }
					defaultLayouts={ { list: {} } }
					onChangeView={ setView }
					selection={ selection }
					onChangeSelection={ handleSelectionChange }
					empty={ getEmptyStateMessage() }
				>
					<DataViews.Layout />
				</DataViews>
			</VStack>
		</div>
	);
}
