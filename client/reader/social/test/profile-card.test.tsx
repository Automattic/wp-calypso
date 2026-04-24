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

	it( 'renders sanitized bioHtml with allowed tags preserved', () => {
		const { container } = render(
			<SocialProfileCard
				bioHtml='<p>hello <a href="https://example.test/">world</a></p><p>second</p>'
				statsLabel="Profile stats"
				stats={ [ { key: 'followers', count: 0, label: 'followers' } ] }
			/>
		);
		const bio = container.querySelector( '.social-profile-card__bio' );
		expect( bio ).not.toBeNull();
		expect( bio?.querySelectorAll( 'p' ) ).toHaveLength( 2 );
		const link = bio?.querySelector( 'a' );
		expect( link ).not.toBeNull();
		expect( link ).toHaveAttribute( 'href', 'https://example.test/' );
	} );

	it( 'strips dangerous tags and event handlers from bioHtml', () => {
		const { container } = render(
			<SocialProfileCard
				bioHtml='<p onclick="alert(1)">hi</p><script>alert(1)</script><img src=x onerror="alert(1)" />'
				statsLabel="Profile stats"
				stats={ [ { key: 'followers', count: 0, label: 'followers' } ] }
			/>
		);
		const bio = container.querySelector( '.social-profile-card__bio' );
		expect( bio ).not.toBeNull();
		expect( bio?.querySelector( 'script' ) ).toBeNull();
		expect( bio?.querySelector( 'img' ) ).toBeNull();
		const paragraph = bio?.querySelector( 'p' );
		expect( paragraph ).not.toBeNull();
		expect( paragraph?.getAttribute( 'onclick' ) ).toBeNull();
	} );

	it( 'strips javascript: and data: hrefs from anchors', () => {
		const { container } = render(
			<SocialProfileCard
				bioHtml={
					'<p><a href="javascript:alert(1)">js</a>' +
					'<a href="data:text/html,<script>alert(1)</script>">data</a>' +
					'<a href="https://safe.example/">safe</a></p>'
				}
				statsLabel="Profile stats"
				stats={ [ { key: 'followers', count: 0, label: 'followers' } ] }
			/>
		);
		const bio = container.querySelector( '.social-profile-card__bio' );
		const anchors = Array.from( bio?.querySelectorAll( 'a' ) ?? [] );
		const hrefs = anchors.map( ( a ) => a.getAttribute( 'href' ) );
		expect( hrefs ).not.toContain( expect.stringMatching( /^javascript:/i ) );
		expect( hrefs ).not.toContain( expect.stringMatching( /^data:/i ) );
		expect( hrefs ).toContain( 'https://safe.example/' );
	} );

	it( 'preserves rel="me" verification links and anchor target/rel pairs', () => {
		const { container } = render(
			<SocialProfileCard
				bioHtml='<p><a href="https://verify.example/" rel="me" target="_blank">verify</a></p>'
				statsLabel="Profile stats"
				stats={ [ { key: 'followers', count: 0, label: 'followers' } ] }
			/>
		);
		const link = container.querySelector( '.social-profile-card__bio a' );
		expect( link ).not.toBeNull();
		expect( link ).toHaveAttribute( 'href', 'https://verify.example/' );
		expect( link?.getAttribute( 'rel' ) ).toMatch( /\bme\b/ );
		expect( link ).toHaveAttribute( 'target', '_blank' );
	} );

	it( 'preserves <span class="mention"> and <a class="mention"> used by Mastodon', () => {
		const { container } = render(
			<SocialProfileCard
				bioHtml={
					'<p><span class="h-card">' +
					'<a href="https://mastodon.social/@alice" class="u-url mention">' +
					'@<span>alice</span></a></span></p>'
				}
				statsLabel="Profile stats"
				stats={ [ { key: 'followers', count: 0, label: 'followers' } ] }
			/>
		);
		const bio = container.querySelector( '.social-profile-card__bio' );
		const mentionAnchor = bio?.querySelector( 'a.u-url.mention' );
		expect( mentionAnchor ).not.toBeNull();
		expect( mentionAnchor ).toHaveAttribute( 'href', 'https://mastodon.social/@alice' );
		// Inner <span>alice</span> survives (class="h-card" / class="u-url" are
		// on outer elements — inner span carries no class but must survive).
		expect( mentionAnchor?.querySelector( 'span' )?.textContent ).toBe( 'alice' );
	} );

	it( 'prefers bioHtml when both bio and bioHtml are provided', () => {
		const { container } = render(
			<SocialProfileCard
				bio="plain"
				bioHtml="<p>rich</p>"
				statsLabel="Profile stats"
				stats={ [ { key: 'followers', count: 0, label: 'followers' } ] }
			/>
		);
		const bio = container.querySelector( '.social-profile-card__bio' );
		expect( bio?.querySelector( 'p' )?.textContent ).toBe( 'rich' );
		expect( bio?.textContent ).not.toContain( 'plain' );
	} );
} );
