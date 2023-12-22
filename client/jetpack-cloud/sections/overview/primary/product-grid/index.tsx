import { ProductData } from 'calypso/jetpack-cloud/sections/overview/primary/overview-products/jetpack-products';
import ProductItem from 'calypso/jetpack-cloud/sections/overview/primary/product-grid/product-item';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { ProductListItem } from 'calypso/state/products-list/selectors/get-products-list';

import './style.scss';

interface Props {
	products: ProductData[];
	userProducts: ProductListItem[];
}

const ProductGrid: React.FC< Props > = ( { products, userProducts } ) => {
	const dispatch = useDispatch();

	// Track the More About click
	const onMoreAboutClick = ( product_slug: string ) => {
		dispatch(
			recordTracksEvent( 'calypso_jetpack_manage_overview_products_more_about_click', {
				product: product_slug,
			} )
		);
	};

	const renderProductGrid = () => {
		return products.map( ( productData: ProductData ) => {
			// We need the underscore version of the product slug
			const userProduct = userProducts.find(
				( p ) => p.product_id === productData.data.product_id
			);

			if ( userProduct === undefined ) {
				return null;
			}

			return (
				<ProductItem
					productData={ productData }
					productSlug={ userProduct.product_slug }
					onMoreAboutClick={ onMoreAboutClick }
				/>
			);
		} );
	};

	return <ul className="overview-products__items">{ renderProductGrid() }</ul>;
};

export default ProductGrid;
