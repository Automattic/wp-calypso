/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

	it( 'renders with popover', async () => {
		const user = userEvent.setup();
		render( <DomainSuggestionBadge popover="Test Popover">Test Badge</DomainSuggestionBadge> );

		const badge = screen.getByRole( 'button', { name: 'Learn more' } );
		await user.click( badge );

		expect( screen.getByText( 'Test Popover' ) ).toBeInTheDocument();
	} );
} );
