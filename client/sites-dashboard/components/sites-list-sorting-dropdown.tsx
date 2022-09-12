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

type SitesListSorting = `${ SitesTableSortKey }-${ SitesTableSortOrder }`;

export const useSitesListSorting = () =>
	useAsyncPreference< SitesListSorting >( {
		defaultValue: 'updated-at-desc',
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
			case 'alphabetically-asc':
				return __( 'Sorted alphabetically (A-Z)' );

			case 'alphabetically-desc':
				return __( 'Sorted alphabetically (Z-A)' );

			case 'updated-at-desc':
				return __( 'Sorted by last publish date' );

			default:
				throw new Error( 'invalid sort key' );
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
							onSitesListSortingChange( 'alphabetically-asc' );
							onClose();
						} }
					>
						{ __( 'Alphabetically (A-Z)' ) }
					</MenuItem>
					<MenuItem
						onClick={ () => {
							onSitesListSortingChange( 'alphabetically-desc' );
							onClose();
						} }
					>
						{ __( 'Alphabetically (Z-A)' ) }
					</MenuItem>
					<MenuItem
						onClick={ () => {
							onSitesListSortingChange( 'updated-at-desc' );
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
