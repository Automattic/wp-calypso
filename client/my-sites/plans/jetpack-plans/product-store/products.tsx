import { SeeAllFeatures } from './see-all-features';
import type { ProductProps } from './types';

const Products: React.FC< ProductProps > = ( { type } ) => {
	return (
		<div className="jetpack-product-store__product">
			{ type === 'products' && <div>Product Component goes here</div> }
			{ type === 'bundles' && (
				<div>
					<SeeAllFeatures />
				</div>
			) }
		</div>
	);
};

export default Products;
