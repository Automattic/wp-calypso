import { useQuery } from '@tanstack/react-query';
import {
	SearchControl,
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
} from '@wordpress/components';
import { DataViews } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { useMemo, useState, useCallback, useRef } from 'react';
import { useAppContext } from '../../app/context';
import SiteIcon from '../../components/site-icon';
import { canManageSite } from '../../sites/features';
import { getSiteDisplayUrl } from '../../utils/site-url';
import type { Site } from '@automattic/api-core';
import type { View } from '@wordpress/dataviews';
import './select-site.scss';

interface Props {
	attachedSiteId?: number;
	onSiteSelect: ( site: Site ) => void;
}

export function SelectSite( { attachedSiteId, onSiteSelect }: Props ) {
	const { queries } = useAppContext();
	const { data: allSites = [], isLoading } = useQuery( queries.sitesQuery() );
	const sites = useMemo(
		() => allSites.filter( ( site ) => canManageSite( site ) && site.ID !== attachedSiteId ),
		[ allSites, attachedSiteId ]
	);
	const searchInputRef = useRef< HTMLInputElement >( null );

	const perPage = 6;
	const [ view, setView ] = useState< View >( {
		type: 'list',
		perPage,
		search: '',
		fields: [ 'URL' ],
		titleField: 'name',
		mediaField: 'icon',
		infiniteScrollEnabled: true,
		startPosition: 1,
	} );

	const [ selection, setSelection ] = useState< string[] >( [] );

	// Handle selection changes
	const handleSelectionChange = useCallback(
		( newSelection: string[] ) => {
			setSelection( newSelection );

			// Get selected site object
			const selectedSite = sites.find( ( site ) =>
				newSelection.includes( site.ID?.toString() ?? '' )
			);

			if ( selectedSite ) {
				onSiteSelect( selectedSite );
			}
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
			label: __( 'Site name' ),
			render: ( { item }: { item: Site } ) => item.name,
		},
		{
			id: 'URL',
			label: 'URL',
			getValue: ( { item }: { item: Site } ) => getSiteDisplayUrl( item ),
		},
	];

	// Apply the search filter. All sites are already loaded client-side, so
	// infinite scroll just reveals more of this in-memory list.
	const filteredSites = useMemo( () => {
		if ( ! view.search ) {
			return sites;
		}
		const searchTerm = view.search.toLowerCase();
		return sites.filter(
			( site ) =>
				site.name?.toLowerCase().includes( searchTerm ) ||
				getSiteDisplayUrl( site ).toLowerCase().includes( searchTerm )
		);
	}, [ sites, view.search ] );

	// DataViews drives infinite scroll by advancing `view.startPosition`; hand
	// it the matching window. `useData` stitches the windows back together.
	const startPosition = view.startPosition ?? 1;
	const displayedData = useMemo(
		() => filteredSites.slice( startPosition - 1, startPosition - 1 + perPage ),
		[ filteredSites, startPosition, perPage ]
	);

	const paginationInfo = {
		totalItems: filteredSites.length,
		totalPages: Math.ceil( filteredSites.length / perPage ) || 1,
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
						__nextHasNoMarginBottom
						ref={ searchInputRef }
						size="compact"
						value={ view.search }
						onChange={ ( search ) => {
							// Reset the scroll window to the top for the new result set.
							setView( { ...view, search, startPosition: 1 } );
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
					empty={ <p>{ getEmptyStateMessage() }</p> }
				>
					<DataViews.Layout />
				</DataViews>
			</VStack>
		</div>
	);
}
