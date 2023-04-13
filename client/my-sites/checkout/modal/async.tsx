import { useSelector } from 'react-redux';
import AsyncLoad from 'calypso/components/async-load';
import getCurrentQueryArguments from 'calypso/state/selectors/get-current-query-arguments';
import { KEY_PRODUCTS } from './constants';
import type { Props } from '.';

const useProducts = () => {
	const { products } = useSelector( ( state ) => {
		const query = getCurrentQueryArguments( state ) || {};
		return {
			products: query[ KEY_PRODUCTS ],
		};
	} );

	return products;
};

const AsyncCheckoutModal = ( props: Props ) => {
	const products = useProducts();

	if ( ! products ) {
		return null;
	}

	return (
		<AsyncLoad
			require="calypso/my-sites/checkout/modal"
			placeholder={ null }
			productAliasFromUrl={ products }
			{ ...props }
		/>
	);
};

export default AsyncCheckoutModal;
