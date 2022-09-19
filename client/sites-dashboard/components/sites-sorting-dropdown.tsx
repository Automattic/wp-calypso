import { Gridicon } from '@automattic/components';
import styled from '@emotion/styled';
import { Button, Dropdown, MenuItemsChoice } from '@wordpress/components';
import { useMediaQuery } from '@wordpress/compose';
import { useI18n } from '@wordpress/react-i18n';
import { useMemo } from 'react';
import { useSitesSorting } from 'calypso/state/sites/hooks/use-sites-sorting';
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

type SitesSortingDropdownProps = ReturnType< typeof useSitesSorting >;

export const SitesSortingDropdown = ( {
	onSitesSortingChange,
	sitesSorting,
	hasSitesSortingPreferenceLoaded,
}: SitesSortingDropdownProps ) => {
	const isSmallScreen = useMediaQuery( SMALL_MEDIA_QUERY );
	const { __ } = useI18n();

	const label = useMemo( () => {
		if ( ! hasSitesSortingPreferenceLoaded ) {
			return null;
		}

		const { sortKey, sortOrder } = sitesSorting;
		const SEPARATOR = '-';

		switch ( `${ sortKey }${ SEPARATOR }${ sortOrder }` ) {
			case `lastInteractedWith${ SEPARATOR }desc`:
				return __( 'Sorted automagically' );

			case `alphabetically${ SEPARATOR }asc`:
				return __( 'Sorted alphabetically' );

			case `updatedAt${ SEPARATOR }desc`:
				return __( 'Sorted by last published' );

			default:
				throw new Error( `invalid sort value ${ sitesSorting }` );
		}
	}, [ __, sitesSorting, hasSitesSortingPreferenceLoaded ] );

	if ( ! hasSitesSortingPreferenceLoaded ) {
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
				<MenuItemsChoice
					value={ sitesSorting }
					onSelect={ ( value: SitesSorting ) => {
						onSitesSortingChange( value );
						onClose();
					} }
					choices={ [
						{
							value: {
								sortKey: 'alphabetically',
								sortOrder: 'asc',
							},
							label: __( 'Alphabetically' ),
						},
						{
							value: {
								sortKey: 'lastInteractedWith',
								sortOrder: 'desc',
							},
							label: __( 'Automagically' ),
						},
						{
							value: {
								sortKey: 'updatedAt',
								sortOrder: 'desc',
							},
							label: __( 'Last published' ),
						},
					] }
				/>
			) }
		/>
	);
};
