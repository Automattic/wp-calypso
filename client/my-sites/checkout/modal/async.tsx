import { useMemo } from 'react';
import AsyncLoad from 'calypso/components/async-load';
import type { Props } from '.';

const useProducts = () => {
	const { search } = window.location;
	const products = useMemo( () => new URLSearchParams( search ).get( 'products' ), [ search ] );

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
