/**
 * @jest-environment jsdom
 */

import { render } from '@testing-library/react';
import DomainSuggestion from 'calypso/components/domains/domain-suggestion';

jest.mock( 'calypso/components/domains/domain-product-price', () => () => 'domain-product-price' );

const noop = () => {};

describe( 'Domain Suggestion', () => {
	describe( 'has attributes', () => {
		test( 'should have data-e2e-domain attribute for e2e testing', () => {
			const { container } = render(
				<DomainSuggestion
					buttonContent="Click Me"
					domain="example.com"
					isAdded={ false }
					onButtonClick={ noop }
					priceRule="PRICE"
				/>
			);

			expect( container.firstChild ).toHaveAttribute( 'data-e2e-domain', 'example.com' );
		} );
	} );
} );
