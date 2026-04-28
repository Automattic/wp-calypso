/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { VerifyPanel } from '../verify-panel';

describe( 'VerifyPanel', () => {
	it( 'renders nothing when not active', () => {
		const { container } = render(
			<VerifyPanel data={ null } error={ null } isLoading={ false } />
		);
		expect( container.firstChild ).toBeNull();
	} );

	it( 'renders profile on success', () => {
		render(
			<VerifyPanel
				data={ {
					handle: '@alice@mastodon.social',
					instance: 'mastodon.social',
					display_name: 'Alice',
					description: 'hello there',
					avatar: null,
					header: null,
					counts: { followers: 10, following: 5, posts: 42 },
					raw: {},
				} }
				error={ null }
				isLoading={ false }
			/>
		);
		expect( screen.getByText( 'hello there' ) ).toBeVisible();
		const stats = screen.getByRole( 'list', { name: /profile stats/i } );
		expect( stats ).toHaveTextContent( '10 followers' );
		expect( stats ).toHaveTextContent( '5 following' );
		expect( stats ).toHaveTextContent( '42 posts' );
	} );

	it( 'renders an HTML description as real markup, not literal tags', () => {
		const { container } = render(
			<VerifyPanel
				data={ {
					handle: '@alice@mastodon.social',
					instance: 'mastodon.social',
					display_name: 'Alice',
					description: '<p>hi <a href="https://example.test/">site</a></p>',
					avatar: null,
					header: null,
					counts: { followers: 0, following: 0, posts: 0 },
					raw: {},
				} }
				error={ null }
				isLoading={ false }
			/>
		);
		const bio = container.querySelector( '.social-profile-card__bio' );
		expect( bio?.querySelector( 'a' ) ).toHaveAttribute( 'href', 'https://example.test/' );
		expect( bio?.textContent ).not.toContain( '<p>' );
	} );

	it( 'renders auth_failed message', () => {
		render( <VerifyPanel data={ null } error={ { kind: 'auth_failed' } } isLoading={ false } /> );
		expect( screen.getByText( /re-authorized/i ) ).toBeVisible();
	} );

	it( 'renders invalid_instance message', () => {
		render(
			<VerifyPanel data={ null } error={ { kind: 'invalid_instance' } } isLoading={ false } />
		);
		expect( screen.getByText( /couldn't reach that mastodon instance/i ) ).toBeVisible();
	} );
} );
