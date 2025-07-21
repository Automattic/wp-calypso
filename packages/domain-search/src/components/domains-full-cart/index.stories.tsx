import { Button } from '@wordpress/components';
import { buildDomain, buildDomainSearchCart } from '../../test-helpers/factories';
import { DomainSearch, useDomainSearch } from '../domain-search';
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
			cart={ buildDomainSearchCart( {
				items: [
					buildDomain( { uuid: '1', domain: 'the-lasso', tld: 'net', price: '$74' } ),
					buildDomain( {
						uuid: '2',
						domain: 'the-lasso',
						tld: 'com',
						originalPrice: '$18',
						price: '$8',
					} ),
					buildDomain( {
						uuid: '3',
						domain: 'the-different-domain',
						tld: 'com',
						originalPrice: '$18',
						price: '$8',
					} ),
					buildDomain( {
						uuid: '4',
						domain: 'the-different-domain1',
						tld: 'com',
						originalPrice: '$18',
						price: '$8',
					} ),
					buildDomain( {
						uuid: '5',
						domain: 'the-different-domain2',
						tld: 'com',
						originalPrice: '$18',
						price: '$8',
					} ),
				],
				total: '$74',
				onAddItem: () => {},
				hasItem: () => false,
				onRemoveItem: ( domain ) => {
					alert( `Remove ${ domain }` );
				},
			} ) }
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
