import { SearchControl } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import LayoutSection from 'calypso/layout/hosting-dashboard/body';
import { SelectedFilters } from '../../lib/product-filter';
import ProductTypeFilter from '../../products-overview/product-filter';
import { BundlePriceSelector } from './bundle-price-selector';

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

	return (
		<LayoutSection className="product-action-panel">
			<div className="product-action-panel__filter">
				<SearchControl
					label={ translate( 'Search' ) }
					value={ searchQuery }
					onChange={ onSearchQueryChange }
				/>

				<ProductTypeFilter
					selectedFilters={ selectedFilters }
					setSelectedFilters={ setSelectedFilters }
					resetFilters={ resetSelectedFilters }
				/>
			</div>

			{ ! isReferralMode && (
				<BundlePriceSelector
					options={ availableBundleSizes }
					value={ selectedBundleSize }
					onChange={ setSelectedBundleSize }
				/>
			) }
		</LayoutSection>
	);
}
