import { SearchControl } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
import LayoutSection from 'calypso/layout/hosting-dashboard/body';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { SelectedFilters } from '../../lib/product-filter';
import ProductTypeFilter from '../../products-overview/product-filter';
import { BundlePriceSelector } from '../bundle-price-selector';

import './style.scss';

type Props = {
	searchQuery: string;
	onSearchQueryChange: ( value: string ) => void;
	selectedFilters: SelectedFilters;
	setSelectedFilters: ( value: SelectedFilters ) => void;
	resetSelectedFilters: () => void;
	isReferralMode?: boolean;
	selectedBundleSize: number;
	availableBundleSizes: number[];
	setSelectedBundleSize: ( value: number ) => void;
};

export default function ProductActionPanel( {
	searchQuery,
	onSearchQueryChange,
	selectedFilters,
	setSelectedFilters,
	resetSelectedFilters,
	isReferralMode,
	selectedBundleSize,
	availableBundleSizes,
	setSelectedBundleSize,
}: Props ) {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const handleSearchQueryChange = useCallback(
		( searchQuery: string ) => {
			onSearchQueryChange( searchQuery );
			dispatch(
				recordTracksEvent( 'calypso_a4a_marketplace_products_overview_input_search', {
					searchQuery,
				} )
			);
		},
		[ dispatch, onSearchQueryChange ]
	);

	const handleSelectedFiltersChange = useCallback(
		( value: SelectedFilters ) => {
			setSelectedFilters( value );
			dispatch(
				recordTracksEvent( 'calypso_a4a_marketplace_products_overview_select_filter', {
					categories: Object.keys( value.categories )
						.filter( ( key ) => value.categories[ key ] )
						.join( ',' ),
					types: Object.keys( value.types )
						.filter( ( key ) => value.types[ key ] )
						.join( ',' ),
					prices: Object.keys( value.prices )
						.filter( ( key ) => value.prices[ key ] )
						.join( ',' ),
				} )
			);
		},
		[ dispatch, setSelectedFilters ]
	);

	const handleResetSelectedFilters = useCallback( () => {
		dispatch( recordTracksEvent( 'calypso_a4a_marketplace_products_overview_reset_filter' ) );
		resetSelectedFilters();
	}, [ dispatch, resetSelectedFilters ] );

	const handleSelectedBundleSizeChange = useCallback(
		( size: number ) => {
			setSelectedBundleSize( size );
			dispatch(
				recordTracksEvent( 'calypso_a4a_marketplace_products_overview_select_bundle_size', {
					size,
				} )
			);
		},
		[ dispatch, setSelectedBundleSize ]
	);

	return (
		<LayoutSection className="product-action-panel">
			<div className="product-action-panel__filter">
				<SearchControl
					label={ translate( 'Search' ) }
					value={ searchQuery }
					onChange={ handleSearchQueryChange }
				/>

				<ProductTypeFilter
					selectedFilters={ selectedFilters }
					setSelectedFilters={ handleSelectedFiltersChange }
					resetFilters={ handleResetSelectedFilters }
				/>
			</div>

			{ ! isReferralMode && (
				<BundlePriceSelector
					options={ availableBundleSizes }
					value={ selectedBundleSize }
					onChange={ handleSelectedBundleSizeChange }
				/>
			) }
		</LayoutSection>
	);
}
