import { Button } from '@wordpress/components';
import { useState } from 'react';
import { DomainSearchContext } from '../DomainSearch/DomainSearch';
import { DomainsFullCart } from './DomainsFullCart';
import type { Meta } from '@storybook/react';

export const Default = () => {
	const [ isFullCartOpen, setIsFullCartOpen ] = useState( true );

	return (
		<DomainSearchContext.Provider
			value={ {
				isFullCartOpen,
				query: '',
				setQuery: () => {},
				onContinue: () => {
					alert( 'Continue' );
				},
				cart: {
					items: [
						{ domain: 'the-lasso', tld: 'net', price: '$74' },
						{ domain: 'the-lasso', tld: 'com', originalPrice: '$18', price: '$8' },
					],
					total: '$74',
					onAddItem: () => {},
					onRemoveItem: () => {},
				},
				closeFullCart: () => setIsFullCartOpen( false ),
				openFullCart: () => setIsFullCartOpen( true ),
			} }
		>
			<DomainsFullCart />
			<Button variant="primary" onClick={ () => setIsFullCartOpen( ! isFullCartOpen ) }>
				{ isFullCartOpen ? 'Close' : 'Open' }
			</Button>
		</DomainSearchContext.Provider>
	);
};

const meta: Meta< typeof Default > = {
	title: 'DomainsFullCart',
	component: Default,
};

export default meta;
