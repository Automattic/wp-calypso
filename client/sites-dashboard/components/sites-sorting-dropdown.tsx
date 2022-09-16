import { Gridicon, SitesTableSortKey, SitesTableSortOrder } from '@automattic/components';
import styled from '@emotion/styled';
import { Button, Dropdown, MenuGroup, MenuItem } from '@wordpress/components';
import { useMediaQuery } from '@wordpress/compose';
import { useI18n } from '@wordpress/react-i18n';
import { useMemo } from 'react';
import { useAsyncPreference } from 'calypso/state/preferences/use-async-preference';
import { SMALL_MEDIA_QUERY } from '../utils';

const SortingButton = styled( Button )( {
	alignSelf: 'stretch',
	flexDirection: 'row-reverse',
	gap: '4px',
	whiteSpace: 'nowrap',
} );

const SortingButtonIcon = styled( Gridicon )( {
	marginRight: '0 !important',
} );

const SEPARATOR = '-' as const;

type SitesSorting = `${ SitesTableSortKey }${ typeof SEPARATOR }${ SitesTableSortOrder }`;

const DEFAULT_SITES_SORTING = {
	sortKey: 'updatedAt',
	sortOrder: 'desc',
} as const;

export const parseSitesSorting = ( sorting: SitesSorting | 'none' ) => {
	if ( sorting === 'none' ) {
		return DEFAULT_SITES_SORTING;
	}

	const [ sortKey, sortOrder ] = sorting.split( SEPARATOR );

	return {
		sortKey: sortKey as SitesTableSortKey,
		sortOrder: sortOrder as SitesTableSortOrder,
	};
};

export const useSitesSortingPreference = () =>
	useAsyncPreference< SitesSorting >( {
		defaultValue: `${ DEFAULT_SITES_SORTING.sortKey }-${ DEFAULT_SITES_SORTING.sortOrder }`,
		preferenceName: 'sites-sorting',
	} );

interface SitesSortingDropdownProps {
	onSitesSortingChange( newValue: SitesSorting ): void;
	sitesSorting: ReturnType< typeof useSitesSortingPreference >[ 0 ];
}

export const SitesSortingDropdown = ( {
	onSitesSortingChange,
	sitesSorting,
}: SitesSortingDropdownProps ) => {
	const isSmallScreen = useMediaQuery( SMALL_MEDIA_QUERY );
	const { __ } = useI18n();

	const label = useMemo( () => {
		if ( sitesSorting === 'none' ) {
			return null;
		}

		switch ( sitesSorting ) {
			case `lastInteractedWith${ SEPARATOR }desc`:
				return __( 'Sorting by: Automagically' );

			case `alphabetically${ SEPARATOR }asc`:
				return __( 'Sorting by: Name' );

			case `updatedAt${ SEPARATOR }desc`:
				return __( 'Sorting by: Last published' );

			default:
				throw new Error( `invalid sort value ${ sitesSorting }` );
		}
	}, [ __, sitesSorting ] );

	if ( sitesSorting === 'none' ) {
		return null;
	}

	return (
		<Dropdown
			position={ isSmallScreen ? 'bottom left' : 'bottom center' }
			renderToggle={ ( { isOpen, onToggle } ) => (
				<SortingButton
					icon={ <SortingButtonIcon icon={ isOpen ? 'chevron-up' : 'chevron-down' } /> }
					iconSize={ 16 }
					onClick={ onToggle }
					aria-expanded={ isOpen }
				>
					{ label }
				</SortingButton>
			) }
			renderContent={ ( { onClose } ) => (
				<MenuGroup>
					<MenuItem
						onClick={ () => {
							onSitesSortingChange( `lastInteractedWith${ SEPARATOR }desc` );
							onClose();
						} }
					>
						{ __( 'Automagically' ) }
					</MenuItem>
					<MenuItem
						onClick={ () => {
							onSitesSortingChange( `alphabetically${ SEPARATOR }asc` );
							onClose();
						} }
					>
						{ __( 'Name' ) }
					</MenuItem>
					<MenuItem
						onClick={ () => {
							onSitesSortingChange( `updatedAt${ SEPARATOR }desc` );
							onClose();
						} }
					>
						{ __( 'Last published' ) }
					</MenuItem>
				</MenuGroup>
			) }
		/>
	);
};
