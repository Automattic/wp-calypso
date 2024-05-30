import { Button, SubmenuPopover, useSubmenuPopoverProps } from '@automattic/components';
import { DropdownMenu, MenuGroup, MenuItem } from '@wordpress/components';
import { Icon, chevronRight, funnel, check } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useRef, useState } from 'react';
import {
	PRODUCT_FILTER_KEY_CATEGORIES,
	PRODUCT_FILTER_KEY_PRICES,
	PRODUCT_FILTER_KEY_TYPES,
} from '../../constants';
import { SelectedFilters, hasSelectedFilter } from '../../lib/product-filter';
import useOnScreen from './hooks/use-on-screen';
import useProductFilterOptions from './hooks/use-product-filter-options';

import './style.scss';

type ProductFilterItemProps = {
	label: string;
	options: { key: string; label: string }[];
	selectedOptions: { [ key: string ]: boolean };
	onOptionClick?: ( option: string ) => void;
};

export function ProductFilterItem( {
	label,
	options,
	selectedOptions,
	onOptionClick,
}: ProductFilterItemProps ) {
	const submenu = useSubmenuPopoverProps< HTMLDivElement >( {
		flip: false,
	} );

	return (
		<div { ...submenu.parent }>
			<MenuItem icon={ chevronRight }>{ label }</MenuItem>
			<SubmenuPopover { ...submenu.submenu } className="components-popover is-product-filter">
				<MenuGroup className="product-filter__group">
					{ options.map( ( option ) => (
						<MenuItem key={ option.key } onClick={ () => onOptionClick?.( option.key ) }>
							<Icon
								icon={ check }
								style={ { visibility: selectedOptions[ option.key ] ? 'visible' : 'hidden' } } // We need to hide the check icon but still keep the space for it
							/>
							{ option.label }
						</MenuItem>
					) ) }
				</MenuGroup>
			</SubmenuPopover>
		</div>
	);
}

type Props = {
	selectedFilters: SelectedFilters;
	setSelectedFilters: ( selectedFilters: SelectedFilters ) => void;
	resetFilters: () => void;
};

export default function ProductFilter( {
	selectedFilters,
	setSelectedFilters,
	resetFilters,
}: Props ) {
	const translate = useTranslate();

	const [ openDropdown, setOpenDropdown ] = useState< boolean >( false );

	const ref = useRef< HTMLDivElement >( null );
	const isVisible = useOnScreen( ref );

	const {
		[ PRODUCT_FILTER_KEY_CATEGORIES ]: categories,
		[ PRODUCT_FILTER_KEY_TYPES ]: types,
		[ PRODUCT_FILTER_KEY_PRICES ]: prices,
	} = useProductFilterOptions();

	const updateFilter = ( type: string, filter: string ) => {
		const record = selectedFilters[ type as keyof SelectedFilters ] as Record< string, boolean >;

		const newFilters = {
			...record,
			[ filter ]: ! record[ filter ],
		};

		setSelectedFilters( {
			...selectedFilters,
			[ type ]: newFilters,
		} );
	};

	useEffect( () => {
		// Dropdown doesn't play well with our layout when scrolling. We need to close it when the toggle is not visible to avoid overlapping issues.
		if ( openDropdown && ! isVisible ) {
			setOpenDropdown( false );
		}
	}, [ isVisible, openDropdown ] );

	const hasSelections = hasSelectedFilter( selectedFilters );

	return (
		<div className="product-filter-container">
			<div ref={ ref }>
				<DropdownMenu
					className="product-filter"
					label={ translate( 'Filter' ) }
					icon={ funnel }
					variant="product-filter"
					open={ openDropdown }
					onToggle={ () => setOpenDropdown( ! openDropdown ) }
				>
					{ () => (
						<MenuGroup className="product-filter__group">
							<ProductFilterItem
								label={ translate( 'Category' ) }
								options={ categories }
								selectedOptions={ selectedFilters[ PRODUCT_FILTER_KEY_CATEGORIES ] }
								onOptionClick={ ( option ) =>
									updateFilter( PRODUCT_FILTER_KEY_CATEGORIES, option )
								}
							/>
							<ProductFilterItem
								label={ translate( 'Type' ) }
								options={ types }
								selectedOptions={ selectedFilters[ PRODUCT_FILTER_KEY_TYPES ] }
								onOptionClick={ ( option ) => updateFilter( PRODUCT_FILTER_KEY_TYPES, option ) }
							/>
							<ProductFilterItem
								label={ translate( 'Price' ) }
								options={ prices }
								selectedOptions={ selectedFilters[ PRODUCT_FILTER_KEY_PRICES ] }
								onOptionClick={ ( option ) => updateFilter( PRODUCT_FILTER_KEY_PRICES, option ) }
							/>
						</MenuGroup>
					) }
				</DropdownMenu>
			</div>

			{ hasSelections && (
				<Button className="product-filter-button" plain onClick={ resetFilters }>
					{ translate( 'Reset filter' ) }
				</Button>
			) }
		</div>
	);
}
