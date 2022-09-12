import { Gridicon, SitesTableSortKey, SitesTableSortOrder } from '@automattic/components';
import styled from '@emotion/styled';
import { Button, Dropdown, MenuGroup, MenuItem } from '@wordpress/components';
import { useI18n } from '@wordpress/react-i18n';
import { useMemo } from 'react';
import { useAsyncPreference } from 'calypso/state/preferences/use-async-preference';

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

type SitesListSorting = `${ SitesTableSortKey }${ typeof SEPARATOR }${ SitesTableSortOrder }`;

const DEFAULT_LIST_SORTING = {
	sortKey: 'updatedAt',
	sortOrder: 'desc',
} as const;

export const parseSorting = ( sorting: SitesListSorting | 'none' ) => {
	if ( sorting === 'none' ) {
		return DEFAULT_LIST_SORTING;
	}

	const [ sortKey, sortOrder ] = sorting.split( SEPARATOR );

	return {
		sortKey: sortKey as SitesTableSortKey,
		sortOrder: sortOrder as SitesTableSortOrder,
	};
};

export const useSitesListSorting = () =>
	useAsyncPreference< SitesListSorting >( {
		defaultValue: `${ DEFAULT_LIST_SORTING.sortKey }-${ DEFAULT_LIST_SORTING.sortOrder }`,
		preferenceName: 'sites-list-sorting',
	} );

interface SitesListSortingDropdownProps {
	onSitesListSortingChange( newValue: SitesListSorting ): void;
	sitesListSorting: ReturnType< typeof useSitesListSorting >[ 0 ];
}

export const SitesListSortingDropdown = ( {
	onSitesListSortingChange,
	sitesListSorting,
}: SitesListSortingDropdownProps ) => {
	const { __ } = useI18n();

	const label = useMemo( () => {
		if ( sitesListSorting === 'none' ) {
			return null;
		}

		switch ( sitesListSorting ) {
			case `alphabetically${ SEPARATOR }asc`:
				return __( 'Sorting: alphabetically (A-Z)' );

			case `alphabetically${ SEPARATOR }desc`:
				return __( 'Sorting: alphabetically (Z-A)' );

			case `updatedAt${ SEPARATOR }desc`:
				return __( 'Sorting: last publish date' );

			default:
				throw new Error( `invalid sort value ${ sitesListSorting }` );
		}
	}, [ __, sitesListSorting ] );

	if ( sitesListSorting === 'none' ) {
		return null;
	}

	return (
		<Dropdown
			position="bottom center"
			renderToggle={ ( { isOpen, onToggle } ) => (
				<SortingButton
					icon={ <SortingButtonIcon icon={ isOpen ? 'arrow-up' : 'arrow-down' } /> }
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
							onSitesListSortingChange( `alphabetically${ SEPARATOR }asc` );
							onClose();
						} }
					>
						{ __( 'Alphabetically (A-Z)' ) }
					</MenuItem>
					<MenuItem
						onClick={ () => {
							onSitesListSortingChange( `alphabetically${ SEPARATOR }desc` );
							onClose();
						} }
					>
						{ __( 'Alphabetically (Z-A)' ) }
					</MenuItem>
					<MenuItem
						onClick={ () => {
							onSitesListSortingChange( `updatedAt${ SEPARATOR }desc` );
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
