import type { ProductProps } from './types';

const Products: React.FC< ProductProps > = ( { type } ) => {
	return (
		<div className="jetpack-product-store__product">
			{ type === 'products' && <div>Product Component goes here</div> }
			{ type === 'bundles' && <div>Bundle Component goes here</div> }
		</div>
	);
};

export default Products;
