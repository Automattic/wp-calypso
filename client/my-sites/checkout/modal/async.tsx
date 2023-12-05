import AsyncLoad from 'calypso/components/async-load';
import { useSelector } from 'calypso/state';
import getCurrentQueryArguments from 'calypso/state/selectors/get-current-query-arguments';
import { KEY_PRODUCTS } from './constants';
import type { Props } from '.';

const AsyncCheckoutModal = ( props: Props ) => {
	const queryArguments = useSelector( getCurrentQueryArguments );
	const products = queryArguments?.[ KEY_PRODUCTS ];

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
