import { Gridicon } from '@automattic/components';
import styled from '@emotion/styled';
import { Button, Dropdown, MenuItemsChoice, NavigableMenu } from '@wordpress/components';
import { useMediaQuery } from '@wordpress/compose';
import { useEffect } from '@wordpress/element';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import {
	stringifySitesSorting,
	parseSitesSorting,
	useSitesSorting,
	ALPHABETICAL_SORTING,
	MAGIC_SORTING,
	LAST_PUBLISHED_SORTING,
} from 'calypso/state/sites/hooks/use-sites-sorting';
import { SMALL_MEDIA_QUERY } from '../utils';

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {};

const SortingButton = styled( Button )( {
	alignSelf: 'stretch',
	flexDirection: 'row-reverse',
	gap: '4px',
	marginInlineEnd: '-12px',
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

	const choices = [
		{
			...ALPHABETICAL_SORTING,
			value: stringifySitesSorting( ALPHABETICAL_SORTING ),
			label: __( 'Name' ),
		},
		{
			...MAGIC_SORTING,
			value: stringifySitesSorting( MAGIC_SORTING ),
			/* translators: name of sorting mode where the details about how best to sort sites are left up to the software */
			label: __( 'Magic' ),
		},
		{
			...LAST_PUBLISHED_SORTING,
			value: stringifySitesSorting( LAST_PUBLISHED_SORTING ),
			label: __( 'Last published' ),
		},
	];

	const currentSortingLabel = choices.find( ( { sortKey } ) => sortKey === sitesSorting.sortKey )
		?.label;

	// Use ALPHABETICAL_SORTING as fallback if current value doesn't match any dropdown option
	const validSorting = currentSortingLabel === undefined ? ALPHABETICAL_SORTING : sitesSorting;

	// Reset preference if it was invalid
	useEffect( () => {
		if ( hasSitesSortingPreferenceLoaded && currentSortingLabel === undefined ) {
			onSitesSortingChange( ALPHABETICAL_SORTING );
		}
	}, [ hasSitesSortingPreferenceLoaded, currentSortingLabel, onSitesSortingChange ] );

	if ( ! hasSitesSortingPreferenceLoaded ) {
		return null;
	}

	const currentSortingValue = stringifySitesSorting( validSorting );
	const validSortingLabel =
		currentSortingLabel ??
		choices.find( ( { sortKey } ) => sortKey === validSorting.sortKey )?.label;

	return (
		<Dropdown
			position={ isSmallScreen ? 'bottom left' : 'bottom center' }
			renderToggle={ ( { isOpen, onToggle } ) => (
				<SortingButton
					icon={ <SortingButtonIcon icon={ isOpen ? 'chevron-up' : 'chevron-down' } /> }
					iconSize={ 16 }
					// translators: %s is the current sorting mode.
					aria-label={ sprintf( __( 'Sorting by %s. Switch sorting mode' ), validSortingLabel ) }
					onClick={ onToggle }
					aria-expanded={ isOpen }
					onKeyDown={ ( event: React.KeyboardEvent ) => {
						if ( ! isOpen && event.code === 'ArrowDown' ) {
							event.preventDefault();
							onToggle();
						}
					} }
				>
					{
						// translators: %s is the current sorting mode.
						sprintf( __( 'Sort: %s' ), validSortingLabel )
					}
				</SortingButton>
			) }
			renderContent={ ( { onClose } ) => (
				<NavigableMenu cycle={ false }>
					<MenuItemsChoice
						value={ currentSortingValue }
						onSelect={ ( value: string ) => {
							onSitesSortingChange(
								parseSitesSorting( value as ( typeof choices )[ 0 ][ 'value' ] )
							);
							onClose();
						} }
						choices={ choices }
						onHover={ noop }
					/>
				</NavigableMenu>
			) }
		/>
	);
};
