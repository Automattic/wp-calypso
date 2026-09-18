import { render, screen } from '@testing-library/react';
import { DomainSearchSkipSuggestion } from '../index';

// Force the "large" container query so the text CTA renders (the mobile layout
// swaps it for an icon-only chevron button, which has no visible label).
jest.mock( '../../../hooks/use-domain-suggestion-container', () => ( {
	...jest.requireActual( '../../../hooks/use-domain-suggestion-container' ),
	useDomainSuggestionContainer: () => ( {
		containerRef: jest.fn(),
		activeQuery: 'large',
		currentWidth: 600,
	} ),
} ) );

describe( 'DomainSearchSkipSuggestion', () => {
	it( 'renders the default "start free" copy for a free suggestion', () => {
		render(
			<DomainSearchSkipSuggestion freeSuggestion="mysite.wordpress.com" onSkip={ jest.fn() } />
		);

		expect( screen.getByText( 'Start free with mysite.wordpress.com' ) ).toBeInTheDocument();
		expect( screen.getByRole( 'button' ) ).toHaveTextContent( 'Start Free' );
	} );

	it( 'renders the custom title and CTA when overrides are provided', () => {
		render(
			<DomainSearchSkipSuggestion
				freeSuggestion="mysite.wordpress.com"
				title="Start with %(domain)s"
				buttonText="Choose a domain later"
				onSkip={ jest.fn() }
			/>
		);

		expect( screen.getByText( 'Start with mysite.wordpress.com' ) ).toBeInTheDocument();
		expect( screen.queryByText( 'Start free with mysite.wordpress.com' ) ).not.toBeInTheDocument();
		expect( screen.getByRole( 'button' ) ).toHaveTextContent( 'Choose a domain later' );
	} );
} );
