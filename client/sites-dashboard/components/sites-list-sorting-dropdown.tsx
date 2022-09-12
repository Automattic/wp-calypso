import { Gridicon } from '@automattic/components';
import styled from '@emotion/styled';
import { Button, Dropdown, MenuGroup, MenuItem } from '@wordpress/components';
import { useI18n } from '@wordpress/react-i18n';

const SortingButton = styled( Button )( {
	alignSelf: 'stretch',
	flexDirection: 'row-reverse',
	gap: '4px',
	whiteSpace: 'nowrap',
} );

const SortingButtonIcon = styled( Gridicon )( {
	marginRight: '0 !important',
} );

export const SitesListSortingDropdown = () => {
	const { __ } = useI18n();

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
					{ __( 'Sorted alphabetically (A-Z)' ) }
				</SortingButton>
			) }
			renderContent={ () => (
				<MenuGroup>
					<MenuItem>{ __( 'Alphabetically (A-Z)' ) }</MenuItem>
					<MenuItem>{ __( 'Alphabetically (Z-A)' ) }</MenuItem>
					<MenuItem>{ __( 'Last published' ) }</MenuItem>
				</MenuGroup>
			) }
		/>
	);
};
