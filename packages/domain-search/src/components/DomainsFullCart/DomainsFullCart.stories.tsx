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
				onContinue: () => {},
				selectedDomains: [],
				closeFullCart: () => setIsFullCartOpen( false ),
				openFullCart: () => setIsFullCartOpen( true ),
			} }
		>
			<DomainsFullCart />
			<Button variant="primary" onClick={ () => setIsFullCartOpen( true ) }>
				Open
			</Button>
		</DomainSearchContext.Provider>
	);
};

const meta: Meta< typeof Default > = {
	title: 'DomainsFullCart',
	component: Default,
};

export default meta;
