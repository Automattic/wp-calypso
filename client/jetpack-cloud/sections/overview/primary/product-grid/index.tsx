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

	return (
		<ul className="overview-products__items">
			{ products.map( ( productData: ProductData ) => {
				return (
					<li key={ productData.data.product_id }>
						<ProductItem productData={ productData } onMoreAboutClick={ onMoreAboutClick } />
					</li>
				);
			} ) }
		</ul>
	);
};

export default ProductGrid;
