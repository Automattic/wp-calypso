import type { ProductStoreProps } from './types';

const ProductStore: React.FC< ProductStoreProps > = () => {
	return (
		<div>
			<p>{ 'Hello there! 👋' }</p>
			<p>{ 'Something cool coming up soon' }</p>
		</div>
	);
};

export default ProductStore;
