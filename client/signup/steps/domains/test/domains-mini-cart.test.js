/**
 * @jest-environment jsdom
 */
import { render, fireEvent } from '@testing-library/react';
import React from 'react';
import { DomainsMiniCart } from '../domains-mini-cart';

describe( 'DomainsMiniCart', () => {
	it( 'renders the correct number of domains in the cart with free wpcom subdomain', () => {
		const removeDomainClickHandlerMock = jest.fn();
		const domainsInCart = [
			{ meta: 'example1.com', cost: 10, currency: 'USD' },
			{ meta: 'example2.com', cost: 20, currency: 'USD' },
		];

		const { getByText } = render(
			<DomainsMiniCart
				domainRemovalQueue={ [] }
				removeDomainClickHandler={ removeDomainClickHandlerMock }
				domainsInCart={ domainsInCart }
				flowName="onboarding"
				wpcomSubdomainSelected={ { domain_name: 'example.wordpress.com' } }
			/>
		);

		expect( getByText( 'Your domains' ) ).toBeInTheDocument();
		expect( getByText( '3 domains' ) ).toBeInTheDocument();
	} );

	it( 'calls removeDomainClickHandler when remove button is clicked', () => {
		const removeDomainClickHandlerMock = jest.fn();
		const domainsInCart = [ { meta: 'example.com', cost: 10, currency: 'USD' } ];

		const { getByText } = render(
			<DomainsMiniCart
				domainRemovalQueue={ [] }
				domainsInCart={ domainsInCart }
				removeDomainClickHandler={ removeDomainClickHandlerMock }
				flowName="onboarding"
			/>
		);

		fireEvent.click( getByText( 'Remove' ) );

		expect( removeDomainClickHandlerMock ).toHaveBeenCalledWith( domainsInCart[ 0 ] );
	} );

	it( 'calls choose my domain latter button and ensure it works as expected', () => {
		const handleSkipClickHandlerMock = jest.fn();
		const domainsInCart = [ { meta: 'example.com', cost: 10, currency: 'USD' } ];

		const { getByText } = render(
			<DomainsMiniCart
				domainRemovalQueue={ [] }
				domainsInCart={ domainsInCart }
				removeDomainClickHandler={ jest.fn() }
				handleSkip={ handleSkipClickHandlerMock }
				flowName="onboarding"
			/>
		);

		fireEvent.click( getByText( 'Choose my domain later' ) );

		expect( handleSkipClickHandlerMock ).toHaveBeenCalledWith( undefined, false, 'choose-later' );
	} );
} );
