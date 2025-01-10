import { useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
import FilterSearch from 'calypso/a8c-for-agencies/components/filter-search';
import LayoutSection from 'calypso/layout/hosting-dashboard/body';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { SelectedFilters } from '../../lib/product-filter';
import ProductTypeFilter from '../../products-overview/product-filter';
import VolumePriceSelector from '../../products-overview/product-listing/volume-price-selector';

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

	const onSearchClick = useCallback(
		() => () =>
			dispatch( recordTracksEvent( `calypso_a4a_marketplace_products_overview_search_click` ) ),
		[ dispatch ]
	);

	return (
		<LayoutSection className="product-action-panel">
			<div className="product-action-panel__filter">
				<FilterSearch
					label={ translate( 'Search' ) }
					onSearch={ onSearchQueryChange }
					onClick={ onSearchClick() }
					initialValue={ searchQuery }
				/>

				<ProductTypeFilter
					selectedFilters={ selectedFilters }
					setSelectedFilters={ setSelectedFilters }
					resetFilters={ resetSelectedFilters }
				/>
			</div>

			{ ! isReferralMode && (
				<VolumePriceSelector
					selectedBundleSize={ selectedBundleSize }
					onBundleSizeChange={ setSelectedBundleSize }
					availableBundleSizes={ availableBundleSizes }
				/>
			) }
		</LayoutSection>
	);
}
