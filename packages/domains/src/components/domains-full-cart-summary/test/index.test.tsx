/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { DomainsFullCartSummary } from '..';
import {
	buildDomain,
	buildDomainSearchCart,
	buildDomainSearchContext,
} from '../../../test-helpers/factories';
import { DomainSearchContext } from '../../domain-search';

describe( 'DomainsFullCartSummary', () => {
	it( 'should display single domain count and total', () => {
		render(
			<DomainSearchContext.Provider
				value={ buildDomainSearchContext( {
					cart: buildDomainSearchCart( {
						items: [ buildDomain( { domain: 'test', tld: 'test', price: '$10.00' } ) ],
						total: '$10.00',
					} ),
				} ) }
			>
				<DomainsFullCartSummary />
			</DomainSearchContext.Provider>
		);

		expect( screen.getByText( '1 domain' ) ).toBeInTheDocument();
		expect( screen.getByText( '$10.00' ) ).toBeInTheDocument();
	} );

	it( 'should display multiple domain count and total', () => {
		render(
			<DomainSearchContext.Provider
				value={ buildDomainSearchContext( {
					cart: buildDomainSearchCart( {
						items: [
							buildDomain( { uuid: '1', domain: 'test1', tld: 'test', price: '$10.00' } ),
							buildDomain( { uuid: '2', domain: 'test2', tld: 'test', price: '$10.00' } ),
						],
						total: '$20.00',
					} ),
				} ) }
			>
				<DomainsFullCartSummary />
			</DomainSearchContext.Provider>
		);

		expect( screen.getByText( '2 domains' ) ).toBeInTheDocument();
		expect( screen.getByText( '$20.00' ) ).toBeInTheDocument();
	} );
} );
