import { useDomainSearch } from '../DomainSearch/DomainSearch';
import { DomainsFullCartItems } from './Items';

const DomainsFullCart = ( { children }: { children?: React.ReactNode } ) => {
	const { isFullCartOpen } = useDomainSearch();

	if ( ! isFullCartOpen ) {
		return null;
	}

	return (
		<div
			style={ {
				position: 'fixed',
				top: 0,
				right: 0,
				bottom: 0,
				background: 'blue',
			} }
		>
			<h1>Cart</h1>
			{ children ?? <DomainsFullCartItems /> }
		</div>
	);
};

DomainsFullCart.Items = DomainsFullCartItems;

export { DomainsFullCart };
