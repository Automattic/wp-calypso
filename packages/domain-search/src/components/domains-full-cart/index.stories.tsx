import { Button } from '@wordpress/components';
import { DomainSearch, useDomainSearch } from '../DomainSearch/DomainSearch';
import { DomainsFullCart } from '.';
import type { Meta } from '@storybook/react';

const FullCartManager = () => {
	const { isFullCartOpen, openFullCart, closeFullCart } = useDomainSearch();

	return (
		<Button
			variant="primary"
			onClick={ () => ( isFullCartOpen ? closeFullCart() : openFullCart() ) }
		>
			{ isFullCartOpen ? 'Close' : 'Open' }
		</Button>
	);
};

export const Default = () => {
	return (
		<DomainSearch
			initialQuery=""
			onContinue={ () => {
				alert( 'Continue' );
			} }
			cart={ {
				items: [
					{ domain: 'the-lasso', tld: 'net', price: '$74' },
					{ domain: 'the-lasso', tld: 'com', originalPrice: '$18', price: '$8' },
					{ domain: 'the-different-domain', tld: 'com', originalPrice: '$18', price: '$8' },
					{ domain: 'the-different-domain1', tld: 'com', originalPrice: '$18', price: '$8' },
					{ domain: 'the-different-domain2', tld: 'com', originalPrice: '$18', price: '$8' },
				],
				total: '$74',
				onAddItem: () => {},
				onRemoveItem: ( domain ) => {
					alert( `Remove ${ domain.domain }.${ domain.tld }` );
				},
			} }
		>
			<DomainsFullCart />
			<FullCartManager />
		</DomainSearch>
	);
};

Default.parameters = {
	viewport: {
		defaultViewport: 'desktop',
	},
};

const meta: Meta< typeof Default > = {
	title: 'DomainsFullCart',
	component: Default,
};

export default meta;

export const Mobile = () => {
	return <Default />;
};

Mobile.parameters = {
	viewport: {
		defaultViewport: 'mobile1',
	},
};
