import page from '@automattic/calypso-router';
import { Button } from '@automattic/components';
import { DropdownMenu, MenuGroup } from '@wordpress/components';
import { funnel } from '@wordpress/icons';
import { getQueryArg, removeQueryArgs } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useRef, useState } from 'react';
import {
	PRODUCT_FILTER_KEY_CATEGORIES,
	PRODUCT_FILTER_KEY_PRICES,
	PRODUCT_FILTER_KEY_TYPES,
	PRODUCT_FILTER_KEY_VENDORS,
} from '../../constants';
import {
	SelectedFilters,
	hasSelectedFilter,
	hasSelectedFilterByType,
} from '../../lib/product-filter';
import useOnScreen from './hooks/use-on-screen';
import useProductFilterOptions from './hooks/use-product-filter-options';
import { ProductFilterItem } from './product-filter-item';
import { ProductFilterSelect } from './product-filter-select';

import './style.scss';

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
		[ PRODUCT_FILTER_KEY_VENDORS ]: vendors,
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

	const category = getQueryArg( window.location.href, 'category' ) as string | undefined;

	useEffect( () => {
		if ( category ) {
			updateFilter( PRODUCT_FILTER_KEY_CATEGORIES, category );
			// Remove the category query arg from the URL as we don't support URL params for filters
			page.redirect(
				removeQueryArgs( window.location.pathname + window.location.search, 'category' )
			);
		}
		// Do not add updateFilter to the dependency array as it will cause an infinite loop
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ category ] );

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
								label={ translate( 'Developed by' ) }
								options={ vendors }
								selectedOptions={ selectedFilters[ PRODUCT_FILTER_KEY_VENDORS ] }
								onOptionClick={ ( option ) => updateFilter( PRODUCT_FILTER_KEY_VENDORS, option ) }
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

			{ hasSelectedFilterByType( selectedFilters[ PRODUCT_FILTER_KEY_CATEGORIES ] ) && (
				<ProductFilterSelect
					label={ translate( 'Category' ) }
					options={ categories }
					selectedOptions={ selectedFilters[ PRODUCT_FILTER_KEY_CATEGORIES ] }
					onOptionClick={ ( option ) => updateFilter( PRODUCT_FILTER_KEY_CATEGORIES, option ) }
				/>
			) }

			{ hasSelectedFilterByType( selectedFilters[ PRODUCT_FILTER_KEY_VENDORS ] ) && (
				<ProductFilterSelect
					label={ translate( 'Developed by' ) }
					options={ vendors }
					selectedOptions={ selectedFilters[ PRODUCT_FILTER_KEY_VENDORS ] }
					onOptionClick={ ( option ) => updateFilter( PRODUCT_FILTER_KEY_VENDORS, option ) }
				/>
			) }

			{ hasSelectedFilterByType( selectedFilters[ PRODUCT_FILTER_KEY_TYPES ] ) && (
				<ProductFilterSelect
					label={ translate( 'Type' ) }
					options={ types }
					selectedOptions={ selectedFilters[ PRODUCT_FILTER_KEY_TYPES ] }
					onOptionClick={ ( option ) => updateFilter( PRODUCT_FILTER_KEY_TYPES, option ) }
				/>
			) }

			{ hasSelectedFilterByType( selectedFilters[ PRODUCT_FILTER_KEY_PRICES ] ) && (
				<ProductFilterSelect
					label={ translate( 'Price' ) }
					options={ prices }
					selectedOptions={ selectedFilters[ PRODUCT_FILTER_KEY_PRICES ] }
					onOptionClick={ ( option ) => updateFilter( PRODUCT_FILTER_KEY_PRICES, option ) }
				/>
			) }

			{ hasSelections && (
				<Button className="product-filter-button" plain onClick={ resetFilters }>
					{ translate( 'Reset filter' ) }
				</Button>
			) }
		</div>
	);
}
