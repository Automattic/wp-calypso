import { Gridicon } from '@automattic/components';
import styled from '@emotion/styled';
import { Button, Dropdown, MenuItemsChoice, NavigableMenu } from '@wordpress/components';
import { useMediaQuery } from '@wordpress/compose';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import {
	stringifySitesSorting,
	parseSitesSorting,
	useSitesSorting,
} from 'calypso/state/sites/hooks/use-sites-sorting';
import { SMALL_MEDIA_QUERY } from '../utils';

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {};

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

	if ( ! hasSitesSortingPreferenceLoaded ) {
		return null;
	}

	const choices = [
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
			/* translators: name of sorting mode where the details about how best to sort sites are left up to the software */
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

	const currentSortingValue = stringifySitesSorting( sitesSorting );
	const currentSortingLabel = choices.find( ( { value } ) => value === currentSortingValue )?.label;

	if ( currentSortingLabel === undefined ) {
		throw new Error( `invalid sort value ${ sitesSorting }` );
	}

	return (
		<Dropdown
			position={ isSmallScreen ? 'bottom left' : 'bottom center' }
			renderToggle={ ( { isOpen, onToggle } ) => (
				<SortingButton
					icon={ <SortingButtonIcon icon={ isOpen ? 'chevron-up' : 'chevron-down' } /> }
					iconSize={ 16 }
					// translators: %s is the current sorting mode.
					aria-label={ sprintf( __( 'Sorting by %s. Switch sorting mode' ), currentSortingLabel ) }
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
						sprintf( __( 'Sort: %s' ), currentSortingLabel )
					}
				</SortingButton>
			) }
			renderContent={ ( { onClose } ) => (
				<NavigableMenu cycle={ false }>
					<MenuItemsChoice
						value={ currentSortingValue }
						onSelect={ ( value: ( typeof choices )[ 0 ][ 'value' ] ) => {
							onSitesSortingChange( parseSitesSorting( value ) );
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
