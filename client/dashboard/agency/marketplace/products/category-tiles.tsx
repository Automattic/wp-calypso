import { __ } from '@wordpress/i18n';
import {
	commentAuthorName,
	currencyDollar,
	lock,
	next,
	people,
	percent,
	postContent,
	shipping,
	siteLogo,
	store,
	trendingUp,
} from '@wordpress/icons';
import SpotTiles from '../../components/showcase/spot-tiles';
import { SPOTS } from '../../components/showcase/spots';
import { getCategoryShortLabels } from './lib/product-categories';
import type { ProductCategory } from './lib/product-categories';

// Each job's glyph, from the classic dashboard's category menu
// (product-filter/hooks/use-product-filter-options), in its order.
export const CATEGORY_ICONS: Record< ProductCategory, JSX.Element > = {
	payments: currencyDollar,
	security: lock,
	performance: next,
	social: people,
	growth: trendingUp,
	shipping,
	conversion: percent,
	'customer-service': commentAuthorName,
	merchandising: siteLogo,
	'store-content': postContent,
	'store-management': store,
};

export function isProductCategory( value: unknown ): value is ProductCategory {
	return typeof value === 'string' && Object.keys( CATEGORY_ICONS ).includes( value );
}

/**
 * The jobs as illustrated tiles, right under search and filter. A
 * tile sets the list's category filter, so the tile, the filter button and
 * the filter chip always show the same selection.
 */
export default function CategoryTiles( {
	selected,
	onSelect,
	lead,
}: {
	selected: ProductCategory | null;
	/** Controls shown in place of the heading, such as search. */
	lead?: React.ReactNode;
	onSelect: ( category: ProductCategory | null ) => void;
} ) {
	const labels = getCategoryShortLabels();
	return (
		<SpotTiles
			title={ __( 'Browse by category' ) }
			label={ __( 'Product categories' ) }
			selected={ selected }
			onSelect={ onSelect }
			lead={ lead }
			options={ ( Object.keys( CATEGORY_ICONS ) as ProductCategory[] ).map( ( category ) => ( {
				value: category,
				label: labels[ category ],
				spot: SPOTS[ category ],
			} ) ) }
		/>
	);
}
