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

	it( 'formats large stat counts in compact notation', () => {
		render(
			<SocialProfileCard
				statsLabel="Profile stats"
				stats={ [
					{ key: 'followers', count: 605312, label: 'followers' },
					{ key: 'following', count: 1234, label: 'following' },
					{ key: 'posts', count: 1500000, label: 'posts' },
				] }
			/>
		);

		const stats = screen.getByRole( 'list', { name: 'Profile stats' } );
		// formatNumberCompact uses Intl.NumberFormat compact notation with
		// maximumFractionDigits: 1, so 605312 -> 605.3K, 1234 -> 1.2K, etc.
		expect( stats ).toHaveTextContent( '605.3K followers' );
		expect( stats ).toHaveTextContent( '1.2K following' );
		expect( stats ).toHaveTextContent( '1.5M posts' );
		expect( stats ).not.toHaveTextContent( '605312' );
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
		const hrefs = anchors.map( ( a ) => a.getAttribute( 'href' ) ?? '' );
		// `not.toContain( expect.stringMatching( ... ) )` is a no-op — the
		// asymmetric matcher is compared by identity inside `toContain`.
		// Assert membership via `some` so a slipped-through `javascript:` URL
		// actually fails the test.
		expect( hrefs.some( ( h ) => /^javascript:/i.test( h ) ) ).toBe( false );
		expect( hrefs.some( ( h ) => /^data:/i.test( h ) ) ).toBe( false );
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
		// The rel hook merges noopener+noreferrer into existing rel tokens; the
		// `me` verification token must still survive alongside them.
		expect( link?.getAttribute( 'rel' ) ).toMatch( /\bnoopener\b/ );
		expect( link?.getAttribute( 'rel' ) ).toMatch( /\bnoreferrer\b/ );
		expect( link ).toHaveAttribute( 'target', '_blank' );
	} );

	it( 'treats target="_BLANK" (uppercase) the same as target="_blank"', () => {
		// HTML target values are case-insensitive: `_BLANK` opens a new window
		// the same way `_blank` does, so the tab-napping defense must apply.
		// Any anchor with a `_blank`-equivalent target reaches the `afterSanitize`
		// hook and must receive rel="noopener noreferrer".
		const { container } = render(
			<SocialProfileCard
				bioHtml='<p><a href="https://example.test/" target="_BLANK">loud</a></p>'
				statsLabel="Profile stats"
				stats={ [ { key: 'followers', count: 0, label: 'followers' } ] }
			/>
		);
		const link = container.querySelector( '.social-profile-card__bio a' );
		expect( link?.getAttribute( 'rel' ) ).toMatch( /\bnoopener\b/ );
		expect( link?.getAttribute( 'rel' ) ).toMatch( /\bnoreferrer\b/ );
	} );

	it( 'forces rel="noopener noreferrer" onto a bare target="_blank" anchor', () => {
		// Hypothetical defense: Mastodon itself always ships rel on bio
		// anchors, but the allowlist accepts target/rel as free-form. A bare
		// `<a target="_blank">` must not leak a window.opener reference.
		const { container } = render(
			<SocialProfileCard
				bioHtml='<p><a href="https://example.test/" target="_blank">bare</a></p>'
				statsLabel="Profile stats"
				stats={ [ { key: 'followers', count: 0, label: 'followers' } ] }
			/>
		);
		const link = container.querySelector( '.social-profile-card__bio a' );
		expect( link?.getAttribute( 'rel' ) ).toMatch( /\bnoopener\b/ );
		expect( link?.getAttribute( 'rel' ) ).toMatch( /\bnoreferrer\b/ );
	} );

	it( 'leaves rel alone when there is no target="_blank"', () => {
		const { container } = render(
			<SocialProfileCard
				bioHtml='<p><a href="https://example.test/" rel="nofollow">inline</a></p>'
				statsLabel="Profile stats"
				stats={ [ { key: 'followers', count: 0, label: 'followers' } ] }
			/>
		);
		const link = container.querySelector( '.social-profile-card__bio a' );
		expect( link?.getAttribute( 'rel' ) ).toBe( 'nofollow' );
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

describe( 'SocialProfileCard — rich variant', () => {
	it( 'renders banner, display name, handle, bio and stats together', () => {
		render(
			<SocialProfileCard
				avatar="https://cdn.example/a.jpg"
				banner="https://cdn.example/b.jpg"
				displayName="Alice"
				handle="alice.bsky.social"
				bioHtml="<p>Hi.</p>"
				stats={ [
					{ key: 'followers', count: 10, label: 'followers' },
					{ key: 'follows', count: 5, label: 'following' },
					{ key: 'posts', count: 3, label: 'posts' },
				] }
				statsLabel="Profile stats"
				headerActions={ <button type="button">View on Bluesky</button> }
			/>
		);

		expect( screen.getByRole( 'heading', { level: 2, name: 'Alice' } ) ).toBeVisible();
		expect( screen.getByText( '@alice.bsky.social' ) ).toBeVisible();
		expect( screen.getByText( 'Hi.' ) ).toBeVisible();
		expect( screen.getByRole( 'list', { name: 'Profile stats' } ) ).toBeVisible();
		expect( screen.getByRole( 'button', { name: 'View on Bluesky' } ) ).toBeVisible();
	} );

	it( 'falls back to the handle when displayName is missing', () => {
		render(
			<SocialProfileCard handle="alice.bsky.social" stats={ [] } statsLabel="Profile stats" />
		);
		expect( screen.getByRole( 'heading', { level: 2, name: 'alice.bsky.social' } ) ).toBeVisible();
	} );

	it( 'omits the heading and handle when both are absent (slim layout)', () => {
		render(
			<SocialProfileCard
				avatar="https://cdn.example/a.jpg"
				bio="Plain bio."
				stats={ [] }
				statsLabel="Profile stats"
			/>
		);
		expect( screen.queryByRole( 'heading' ) ).toBeNull();
		expect( screen.queryByText( /@/ ) ).toBeNull();
		expect( screen.getByText( 'Plain bio.' ) ).toBeVisible();
	} );

	it( 'hides the banner image on load failure', () => {
		const { container } = render(
			<SocialProfileCard
				banner="https://cdn.example/broken.jpg"
				displayName="Alice"
				stats={ [] }
				statsLabel="Profile stats"
			/>
		);
		const banner = container.querySelector(
			'.social-profile-card__banner'
		) as HTMLImageElement | null;
		expect( banner ).not.toBeNull();
		banner!.dispatchEvent( new Event( 'error', { bubbles: true } ) );
		expect( banner!.style.display ).toBe( 'none' );
	} );
} );
