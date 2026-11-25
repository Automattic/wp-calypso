/**
 * @vitest-environment jsdom
 */

import { render } from '@testing-library/react';
import { vi } from 'vitest';
import DomainSuggestion from 'calypso/components/domains/domain-suggestion';

vi.mock( 'calypso/components/domains/domain-product-price', () => ( {
	default: () => 'domain-product-price',
} ) );

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
				>
					<span>Fake Child Element</span>
					<span>Fake Child Element</span>
					<span>Fake Child Element</span>
				</DomainSuggestion>
			);

			expect( container.firstChild ).toHaveAttribute( 'data-e2e-domain', 'example.com' );
		} );
	} );
} );
