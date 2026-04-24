/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { SocialProfileCard } from '../profile-card';

describe( 'SocialProfileCard', () => {
	it( 'renders avatar, stats, and bio', () => {
		render(
			<SocialProfileCard
				avatar="https://example.test/avatar.jpg"
				bio="hello world"
				statsLabel="Profile stats"
				stats={ [
					{ key: 'followers', count: 10, label: 'followers' },
					{ key: 'following', count: 5, label: 'following' },
					{ key: 'posts', count: 42, label: 'posts' },
				] }
			/>
		);

		const avatar = screen.getByRole( 'presentation' );
		expect( avatar ).toHaveAttribute( 'src', 'https://example.test/avatar.jpg' );
		const stats = screen.getByRole( 'list', { name: 'Profile stats' } );
		expect( stats ).toHaveTextContent( '10 followers' );
		expect( stats ).toHaveTextContent( '5 following' );
		expect( stats ).toHaveTextContent( '42 posts' );
		expect( screen.getByText( 'hello world' ) ).toBeVisible();
	} );

	it( 'omits avatar when null', () => {
		render(
			<SocialProfileCard
				avatar={ null }
				statsLabel="Profile stats"
				stats={ [ { key: 'followers', count: 0, label: 'followers' } ] }
			/>
		);
		expect( screen.queryByRole( 'presentation' ) ).not.toBeInTheDocument();
	} );

	it( 'omits bio when empty', () => {
		const { container } = render(
			<SocialProfileCard
				statsLabel="Profile stats"
				stats={ [ { key: 'followers', count: 0, label: 'followers' } ] }
			/>
		);
		expect( container.querySelector( '.social-profile-card__bio' ) ).toBeNull();
	} );
} );
