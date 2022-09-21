import { Gridicon } from '@automattic/components';
import styled from '@emotion/styled';
import { Button, Dropdown, MenuItemsChoice } from '@wordpress/components';
import { useMediaQuery } from '@wordpress/compose';
import { useI18n } from '@wordpress/react-i18n';
import { useMemo } from 'react';
import {
	stringifySitesSorting,
	parseSitesSorting,
	useSitesSorting,
} from 'calypso/state/sites/hooks/use-sites-sorting';
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
				return __( 'Sort: Magic' );

			case `alphabetically${ SEPARATOR }asc`:
				return __( 'Sort: Name' );

			case `updatedAt${ SEPARATOR }desc`:
				return __( 'Sort: Last published' );

			default:
				throw new Error( `invalid sort value ${ sitesSorting }` );
		}
	}, [ __, sitesSorting, hasSitesSortingPreferenceLoaded ] );

	const choices = useMemo( () => {
		return [
			{
				value: stringifySitesSorting( {
					sortKey: 'alphabetically',
					sortOrder: 'asc',
				} ),
				label: __( 'Name' ),
			},
			{
				value: stringifySitesSorting( {
					sortKey: 'lastInteractedWith',
					sortOrder: 'desc',
				} ),
				label: __( 'Magic' ),
			},
			{
				value: stringifySitesSorting( {
					sortKey: 'updatedAt',
					sortOrder: 'desc',
				} ),
				label: __( 'Last published' ),
			},
		];
	}, [ __ ] );

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
					title={ __( 'Switch sorting mode' ) }
					onClick={ onToggle }
					aria-expanded={ isOpen }
				>
					{ label }
				</SortingButton>
			) }
			renderContent={ ( { onClose } ) => (
				<MenuItemsChoice
					value={ stringifySitesSorting( sitesSorting ) }
					onSelect={ ( value: Parameters< typeof parseSitesSorting >[ 0 ] ) => {
						onSitesSortingChange( parseSitesSorting( value ) );
						onClose();
					} }
					choices={ choices }
				/>
			) }
		/>
	);
};
