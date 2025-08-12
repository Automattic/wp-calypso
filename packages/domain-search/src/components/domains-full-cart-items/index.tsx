import { __experimentalVStack as VStack } from '@wordpress/components';
import { useDomainSearch } from '../domain-search';
import { DomainsFullCartItem } from './item';

import './style.scss';

export const DomainsFullCartItems = () => {
	const { cart } = useDomainSearch();

	return (
		<VStack spacing={ 3 }>
			{ cart.items.map( ( domain ) => (
				<DomainsFullCartItem key={ domain.uuid } domain={ domain } />
			) ) }
		</VStack>
	);
};
