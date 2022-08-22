import StoreFooter from 'calypso/jetpack-connect/store-footer';
import type { ProductStoreProps } from './types';

const ProductStore: React.FC< ProductStoreProps > = () => {
	return (
		<div>
			<p>{ 'Hello there! 👋' }</p>
			<p>{ 'Something cool coming up soon' }</p>
			<StoreFooter />
		</div>
	);
};

export default ProductStore;
