/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { DomainSuggestionBadge } from '..';

describe( 'DomainSuggestionBadge', () => {
	it( 'renders children content', () => {
		render( <DomainSuggestionBadge>Test Badge</DomainSuggestionBadge> );
		expect( screen.getByText( 'Test Badge' ) ).toBeInTheDocument();
	} );

	it( 'renders with warning variation', () => {
		render( <DomainSuggestionBadge variation="warning">Warning Badge</DomainSuggestionBadge> );
		const badge = screen.getByText( 'Warning Badge' );

		expect( badge.className ).toContain( 'warning' );
	} );
} );
