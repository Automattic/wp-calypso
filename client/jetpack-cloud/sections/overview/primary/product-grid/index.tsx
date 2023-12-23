import { ProductData } from 'calypso/jetpack-cloud/sections/overview/primary/overview-products/jetpack-products';
import ProductItem from 'calypso/jetpack-cloud/sections/overview/primary/product-grid/product-item';
import type { MouseEvent as ReactMouseEvent } from 'react';

import './style.scss';

interface Props {
	products: ProductData[];
	onMoreAboutClick: ( e: ReactMouseEvent< HTMLAnchorElement, MouseEvent >, slug: string ) => void;
}

const ProductGrid: React.FC< Props > = ( { products, onMoreAboutClick } ) => {
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
