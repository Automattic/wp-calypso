import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DomainsFullCartItems } from '..';
import {
	buildDomain,
	buildDomainSearchCart,
	buildDomainSearchContext,
} from '../../../test-helpers/factories';
import { DomainSearchContext } from '../../domain-search';

describe( 'DomainsFullCartItems', () => {
	test( 'renders domains list including name and tld', () => {
		render(
			<DomainSearchContext.Provider
				value={ buildDomainSearchContext( {
					cart: buildDomainSearchCart( {
						items: [
							buildDomain( { domain: 'example', tld: 'com', price: '$10' } ),
							buildDomain( { domain: 'test', tld: 'org', price: '$15' } ),
						],
					} ),
				} ) }
			>
				<DomainsFullCartItems />
			</DomainSearchContext.Provider>
		);

		expect( screen.getByLabelText( 'example.com' ) ).toBeVisible();
		expect( screen.getByLabelText( 'test.org' ) ).toBeVisible();
	} );

	test( 'calls cart.onRemove when clicking on the "Remove" button', async () => {
		const user = userEvent.setup();
		const onRemoveItem = jest.fn();

		render(
			<DomainSearchContext.Provider
				value={ buildDomainSearchContext( {
					cart: buildDomainSearchCart( {
						items: [ buildDomain() ],
						onRemoveItem,
					} ),
				} ) }
			>
				<DomainsFullCartItems />
			</DomainSearchContext.Provider>
		);

		await user.click( screen.getByRole( 'button', { name: 'Remove' } ) );

		expect( onRemoveItem ).toHaveBeenCalledWith( '1' );
	} );

	test( 'renders the original price if included', () => {
		render(
			<DomainSearchContext.Provider
				value={ buildDomainSearchContext( {
					cart: buildDomainSearchCart( {
						items: [ buildDomain( { originalPrice: '$20' } ) ],
					} ),
				} ) }
			>
				<DomainsFullCartItems />
			</DomainSearchContext.Provider>
		);

		expect( screen.getByText( '$20' ) ).toBeVisible();
		expect( screen.getByText( '$10/year' ) ).toBeVisible();
	} );
} );
