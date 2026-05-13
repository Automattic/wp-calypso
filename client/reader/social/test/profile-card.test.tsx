/**
 * @jest-environment jsdom
 */
import page from '@automattic/calypso-router';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SocialAnalyticsProvider } from '../components/post-card/analytics-context';
import { SocialProfileCard } from '../profile-card';

jest.mock( '@automattic/calypso-router', () => jest.fn() );
const pageMock = jest.mocked( page );

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

	it( 'forces target="_blank" and merges hardened rel into existing rel tokens', () => {
		// The shared sanitizer hook hardens every surviving anchor (not just
		// those with target="_blank" upstream): it forces target="_blank" and
		// merges nofollow/noopener/noreferrer into the existing rel token set
		// so pre-existing tokens like `nofollow` survive without duplication.
		const { container } = render(
			<SocialProfileCard
				bioHtml='<p><a href="https://example.test/" rel="nofollow">inline</a></p>'
				statsLabel="Profile stats"
				stats={ [ { key: 'followers', count: 0, label: 'followers' } ] }
			/>
		);
		const link = container.querySelector( '.social-profile-card__bio a' );
		expect( link ).toHaveAttribute( 'target', '_blank' );
		const rel = link?.getAttribute( 'rel' ) ?? '';
		expect( rel ).toMatch( /\bnofollow\b/ );
		expect( rel ).toMatch( /\bnoopener\b/ );
		expect( rel ).toMatch( /\bnoreferrer\b/ );
		// nofollow appears exactly once (token-set merge, not naive append).
		expect( rel.match( /\bnofollow\b/g ) ).toHaveLength( 1 );
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

	it( 'forces target="_blank" and hardened rel on bio anchors', () => {
		render(
			<SocialProfileCard
				avatar={ null }
				stats={ [] }
				statsLabel="Profile stats"
				bioHtml='<p><a href="https://example.com">site</a></p>'
			/>
		);
		const link = screen.getByRole( 'link', { name: 'site' } );
		expect( link ).toHaveAttribute( 'target', '_blank' );
		const rel = link.getAttribute( 'rel' ) ?? '';
		expect( rel ).toContain( 'nofollow' );
		expect( rel ).toContain( 'noopener' );
		expect( rel ).toContain( 'noreferrer' );
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

	it( 'preserves DID-shaped data-id on @-mention anchors in the bio', () => {
		const { container } = render(
			<SocialProfileCard
				bioHtml={
					'<p><a href="https://bsky.app/profile/did:plc:bobbobbobbobbobbobbobbob"' +
					' data-id="did:plc:bobbobbobbobbobbobbobbob">@bob.bsky.social</a></p>'
				}
				statsLabel="Profile stats"
				stats={ [ { key: 'followers', count: 0, label: 'followers' } ] }
			/>
		);
		const link = container.querySelector( '.social-profile-card__bio a' );
		expect( link ).toHaveAttribute( 'data-id', 'did:plc:bobbobbobbobbobbobbobbob' );
	} );

	it( 'preserves handle-shaped data-id on @-mention anchors in the bio', () => {
		const { container } = render(
			<SocialProfileCard
				bioHtml={
					'<p><a href="https://bsky.app/profile/alice.bsky.social"' +
					' data-id="alice.bsky.social">@alice.bsky.social</a></p>'
				}
				statsLabel="Profile stats"
				stats={ [ { key: 'followers', count: 0, label: 'followers' } ] }
			/>
		);
		const link = container.querySelector( '.social-profile-card__bio a' );
		expect( link ).toHaveAttribute( 'data-id', 'alice.bsky.social' );
	} );

	it( 'preserves data-handle alongside data-id on bio mention anchors (CM-725)', () => {
		const { container } = render(
			<SocialProfileCard
				bioHtml={
					'<p><a href="https://example.com/@alice"' +
					' data-id="https://example.com/users/alice"' +
					' data-handle="alice@example.com">@alice@example.com</a></p>'
				}
				statsLabel="Profile stats"
				stats={ [ { key: 'followers', count: 0, label: 'followers' } ] }
			/>
		);
		const link = container.querySelector( '.social-profile-card__bio a' );
		expect( link ).toHaveAttribute( 'data-id', 'https://example.com/users/alice' );
		expect( link ).toHaveAttribute( 'data-handle', 'alice@example.com' );
	} );

	it( 'strips arbitrary data-* attributes from bio anchors', () => {
		const { container } = render(
			<SocialProfileCard
				bioHtml={
					'<p><a href="https://example.test/" data-id="42"' +
					' data-tracking="x" data-evil="payload">y</a></p>'
				}
				statsLabel="Profile stats"
				stats={ [ { key: 'followers', count: 0, label: 'followers' } ] }
			/>
		);
		const link = container.querySelector( '.social-profile-card__bio a' );
		expect( link ).toHaveAttribute( 'data-id', '42' );
		expect( link?.hasAttribute( 'data-tracking' ) ).toBe( false );
		expect( link?.hasAttribute( 'data-evil' ) ).toBe( false );
	} );

	it( 'renders a stat as a link when href is provided', () => {
		render(
			<SocialProfileCard
				avatar="https://example.test/avatar.jpg"
				bio="hi"
				statsLabel="Profile stats"
				stats={ [
					{ key: 'followers', count: 10, label: 'followers', href: '/profile/me/followers' },
					{ key: 'following', count: 5, label: 'following' },
				] }
			/>
		);
		const link = screen.getByRole( 'link', { name: /10 followers/i } );
		expect( link ).toHaveAttribute( 'href', '/profile/me/followers' );
		expect( screen.queryByRole( 'link', { name: /5 following/i } ) ).not.toBeInTheDocument();
	} );
} );

describe( 'SocialProfileCard — bio mention click routing', () => {
	const onClick = jest.fn();

	function renderInsideProvider(
		bioHtml: string,
		getProfileUrl: ( ref: {
			id?: string | null;
			handle?: string | null;
			did?: string | null;
		} ) => string | null
	) {
		return render(
			<SocialAnalyticsProvider
				value={ {
					source: 'atmosphere',
					connectionId: 7,
					onClick,
					getProfileUrl,
				} }
			>
				<SocialProfileCard
					bioHtml={ bioHtml }
					statsLabel="Profile stats"
					stats={ [ { key: 'followers', count: 0, label: 'followers' } ] }
				/>
			</SocialAnalyticsProvider>
		);
	}

	beforeEach( () => {
		pageMock.mockClear();
		onClick.mockClear();
	} );

	it( 'routes the click in-app when data-id resolves to an in-app URL', async () => {
		const user = userEvent.setup();
		const getProfileUrl = jest.fn( ( ref: { id?: string | null } ) =>
			ref.id ? `/reader/atmosphere/7/profile/${ ref.id }` : null
		);
		const { getByText } = renderInsideProvider(
			'<p><a href="https://bsky.app/profile/did:plc:abc"' +
				' data-id="did:plc:abc">@bob.bsky.social</a></p>',
			getProfileUrl
		);
		await user.click( getByText( '@bob.bsky.social' ) );
		expect( pageMock ).toHaveBeenCalledWith( '/reader/atmosphere/7/profile/did:plc:abc' );
	} );

	it( 'leaves anchors without data-id alone (no in-app routing)', async () => {
		const user = userEvent.setup();
		const getProfileUrl = jest.fn( () => '/reader/atmosphere/7/profile/anything' );
		const { getByText } = renderInsideProvider(
			'<p><a href="https://bsky.app/hashtag/SFGiants">#SFGiants</a></p>',
			getProfileUrl
		);
		await user.click( getByText( '#SFGiants' ) );
		expect( pageMock ).not.toHaveBeenCalled();
		expect( getProfileUrl ).not.toHaveBeenCalled();
	} );

	it( 'fires *_mention_unresolved Tracks when data-id is present but resolver returns null', async () => {
		const user = userEvent.setup();
		const getProfileUrl = jest.fn( () => null );
		const { getByText } = renderInsideProvider(
			'<p><a href="https://bsky.app/profile/bogus" data-id="bogus">@bogus</a></p>',
			getProfileUrl
		);
		await user.click( getByText( '@bogus' ) );
		expect( pageMock ).not.toHaveBeenCalled();
		expect( onClick ).toHaveBeenCalledWith(
			'calypso_reader_atmosphere_timeline_mention_unresolved',
			expect.objectContaining( { connection_id: 7, data_id: 'bogus' } )
		);
	} );

	it( 'passes through modifier-clicks (cmd) so users can open in a new tab', async () => {
		const user = userEvent.setup();
		const getProfileUrl = jest.fn( ( ref: { id?: string | null } ) =>
			ref.id ? `/reader/atmosphere/7/profile/${ ref.id }` : null
		);
		const { getByText } = renderInsideProvider(
			'<p><a href="https://bsky.app/profile/did:plc:abc"' +
				' data-id="did:plc:abc">@bob.bsky.social</a></p>',
			getProfileUrl
		);
		await user.keyboard( '[MetaLeft>]' );
		await user.click( getByText( '@bob.bsky.social' ) );
		await user.keyboard( '[/MetaLeft]' );
		expect( pageMock ).not.toHaveBeenCalled();
	} );

	it( 'passes data-id as handle, did, and id so atmosphere-style resolvers can validate', async () => {
		// Regression: bios on the atmosphere profile page render mention
		// anchors stamped with the *handle* in data-id (e.g. "alice.bsky.social")
		// when the backend can't resolve a DID. Atmosphere's resolver validates
		// `ref.handle` against HANDLE_RE first; if the click handler only sent
		// the value as `did`, the resolver returned null and the click escaped
		// to bsky.app. Assert the call site populates all three fields so any
		// per-protocol resolver picks whichever it understands.
		const user = userEvent.setup();
		const getProfileUrl = jest.fn( ( ref: { handle?: string | null } ) =>
			ref.handle ? `/reader/atmosphere/7/profile/${ ref.handle }` : null
		);
		const { getByText } = renderInsideProvider(
			'<p><a href="https://bsky.app/profile/alice.bsky.social"' +
				' data-id="alice.bsky.social">@alice</a></p>',
			getProfileUrl
		);
		await user.click( getByText( '@alice' ) );
		expect( getProfileUrl ).toHaveBeenCalledWith( {
			id: 'alice.bsky.social',
			handle: 'alice.bsky.social',
			did: 'alice.bsky.social',
		} );
		expect( pageMock ).toHaveBeenCalledWith( '/reader/atmosphere/7/profile/alice.bsky.social' );
	} );

	it( 'is a no-op when no analytics provider is in scope (slim layout)', async () => {
		const user = userEvent.setup();
		const { getByText } = render(
			<SocialProfileCard
				bioHtml={
					'<p><a href="https://bsky.app/profile/alice.bsky.social"' +
					' data-id="alice.bsky.social">@alice</a></p>'
				}
				statsLabel="Profile stats"
				stats={ [ { key: 'followers', count: 0, label: 'followers' } ] }
			/>
		);
		await user.click( getByText( '@alice' ) );
		expect( pageMock ).not.toHaveBeenCalled();
	} );

	it( 'passes data-handle as ref.handle separately from data-id (CM-725)', async () => {
		// Bios on Fediverse / Mastodon profile pages can carry mention
		// anchors stamped with both `data-id` (canonical id — actor URL
		// or numeric) and `data-handle` (webfinger). The bio click
		// handler routes them to distinct ref fields so resolvers can
		// build a clean user-readable URL from the handle.
		const user = userEvent.setup();
		const getProfileUrl = jest.fn( ( ref: { handle?: string | null } ) =>
			ref.handle ? `/reader/fediverse/7/profile/${ ref.handle }` : null
		);
		const { getByText } = renderInsideProvider(
			'<p><a href="https://example.com/@alice"' +
				' data-id="https://example.com/users/alice"' +
				' data-handle="alice@example.com">@alice</a></p>',
			getProfileUrl
		);
		await user.click( getByText( '@alice' ) );
		expect( getProfileUrl ).toHaveBeenCalledWith( {
			id: 'https://example.com/users/alice',
			handle: 'alice@example.com',
			did: 'https://example.com/users/alice',
		} );
		expect( pageMock ).toHaveBeenCalledWith( '/reader/fediverse/7/profile/alice@example.com' );
	} );
} );

describe( 'SocialProfileCard — bio hashtag click routing', () => {
	const onClick = jest.fn();

	function renderInsideProvider( bioHtml: string, getTagUrl: ( tag: string ) => string | null ) {
		return render(
			<SocialAnalyticsProvider
				value={ {
					source: 'atmosphere',
					connectionId: 7,
					onClick,
					getTagUrl,
				} }
			>
				<SocialProfileCard
					bioHtml={ bioHtml }
					statsLabel="Profile stats"
					stats={ [ { key: 'followers', count: 0, label: 'followers' } ] }
				/>
			</SocialAnalyticsProvider>
		);
	}

	beforeEach( () => {
		pageMock.mockClear();
		onClick.mockClear();
	} );

	it( 'preserves data-tag on hashtag anchors in the bio (sanitiser allow-list)', () => {
		// Regression: BIO_SANITIZE_CONFIG must allow `data-tag` so the click
		// handler can route hashtag clicks in-app. Without it, DOMPurify strips
		// the attribute and the click falls through to the bsky.app href.
		const { container } = render(
			<SocialProfileCard
				bioHtml={
					'<p><a href="https://bsky.app/hashtag/wordpress"' +
					' data-tag="wordpress">#WordPress</a></p>'
				}
				statsLabel="Profile stats"
				stats={ [ { key: 'followers', count: 0, label: 'followers' } ] }
			/>
		);
		const link = container.querySelector( '.social-profile-card__bio a' );
		expect( link ).toHaveAttribute( 'data-tag', 'wordpress' );
	} );

	it( 'routes the click in-app when data-tag resolves to an in-app URL', async () => {
		const user = userEvent.setup();
		const getTagUrl = jest.fn( ( tag: string ) => `/reader/atmosphere/7/tag/${ tag }` );
		const { getByText } = renderInsideProvider(
			'<p><a href="https://bsky.app/hashtag/wordpress"' +
				' data-tag="wordpress">#WordPress</a></p>',
			getTagUrl
		);
		await user.click( getByText( '#WordPress' ) );
		expect( getTagUrl ).toHaveBeenCalledWith( 'wordpress' );
		expect( pageMock ).toHaveBeenCalledWith( '/reader/atmosphere/7/tag/wordpress' );
	} );

	it( 'fires *_tag_unresolved Tracks when data-tag is present but resolver returns null', async () => {
		const user = userEvent.setup();
		const getTagUrl = jest.fn( () => null );
		const { getByText } = renderInsideProvider(
			'<p><a href="https://bsky.app/hashtag/wordpress"' +
				' data-tag="wordpress">#WordPress</a></p>',
			getTagUrl
		);
		await user.click( getByText( '#WordPress' ) );
		expect( pageMock ).not.toHaveBeenCalled();
		expect( onClick ).toHaveBeenCalledWith(
			'calypso_reader_atmosphere_timeline_tag_unresolved',
			expect.objectContaining( { connection_id: 7, data_tag: 'wordpress' } )
		);
	} );

	it( 'passes through modifier-clicks on hashtag anchors so users can open in a new tab', async () => {
		const user = userEvent.setup();
		const getTagUrl = jest.fn( ( tag: string ) => `/reader/atmosphere/7/tag/${ tag }` );
		const { getByText } = renderInsideProvider(
			'<p><a href="https://bsky.app/hashtag/wordpress"' +
				' data-tag="wordpress">#WordPress</a></p>',
			getTagUrl
		);
		await user.keyboard( '[MetaLeft>]' );
		await user.click( getByText( '#WordPress' ) );
		await user.keyboard( '[/MetaLeft]' );
		expect( pageMock ).not.toHaveBeenCalled();
	} );

	it( 'is a no-op for hashtag clicks when no analytics provider is in scope (slim layout)', async () => {
		const user = userEvent.setup();
		const { getByText } = render(
			<SocialProfileCard
				bioHtml={
					'<p><a href="https://bsky.app/hashtag/wordpress"' +
					' data-tag="wordpress">#WordPress</a></p>'
				}
				statsLabel="Profile stats"
				stats={ [ { key: 'followers', count: 0, label: 'followers' } ] }
			/>
		);
		await user.click( getByText( '#WordPress' ) );
		expect( pageMock ).not.toHaveBeenCalled();
	} );

	it( 'data-id takes precedence when both attributes are on the same anchor', async () => {
		const user = userEvent.setup();
		const getProfileUrl = jest.fn( ( ref: { id?: string | null } ) =>
			ref.id ? `/reader/atmosphere/7/profile/${ ref.id }` : null
		);
		const getTagUrl = jest.fn( () => '/reader/atmosphere/7/tag/wrong' );
		const { getByText } = render(
			<SocialAnalyticsProvider
				value={ {
					source: 'atmosphere',
					connectionId: 7,
					onClick,
					getProfileUrl,
					getTagUrl,
				} }
			>
				<SocialProfileCard
					bioHtml={
						'<p><a href="https://bsky.app/profile/alice.bsky.social"' +
						' data-id="alice.bsky.social" data-tag="wordpress">@alice</a></p>'
					}
					statsLabel="Profile stats"
					stats={ [ { key: 'followers', count: 0, label: 'followers' } ] }
				/>
			</SocialAnalyticsProvider>
		);
		await user.click( getByText( '@alice' ) );
		expect( pageMock ).toHaveBeenCalledWith( '/reader/atmosphere/7/profile/alice.bsky.social' );
		expect( getTagUrl ).not.toHaveBeenCalled();
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

	it( 'wraps the display name in an external link when displayNameLink is set', () => {
		render(
			<SocialProfileCard
				displayName="Alice"
				handle="alice.bsky.social"
				displayNameLink="https://bsky.app/profile/alice.bsky.social"
				stats={ [] }
				statsLabel="Profile stats"
			/>
		);
		const link = screen.getByRole( 'link', { name: 'Alice' } );
		expect( link ).toHaveAttribute( 'href', 'https://bsky.app/profile/alice.bsky.social' );
		expect( link ).toHaveAttribute( 'target', '_blank' );
		expect( link ).toHaveAttribute( 'rel', 'noopener noreferrer' );
		// The heading's accessible name remains the bare display name so
		// existing heading-by-name lookups continue to work.
		expect( screen.getByRole( 'heading', { level: 2, name: 'Alice' } ) ).toBeVisible();
	} );

	it( 'falls back to the handle inside the link when displayName is missing', () => {
		render(
			<SocialProfileCard
				handle="alice.bsky.social"
				displayNameLink="https://bsky.app/profile/alice.bsky.social"
				stats={ [] }
				statsLabel="Profile stats"
			/>
		);
		const link = screen.getByRole( 'link', { name: 'alice.bsky.social' } );
		expect( link ).toBeVisible();
	} );

	it( 'renders the display name as plain text when no displayNameLink is provided', () => {
		render(
			<SocialProfileCard
				displayName="Alice"
				handle="alice.bsky.social"
				stats={ [] }
				statsLabel="Profile stats"
			/>
		);
		expect( screen.queryByRole( 'link', { name: 'Alice' } ) ).not.toBeInTheDocument();
		expect( screen.getByRole( 'heading', { level: 2, name: 'Alice' } ) ).toBeVisible();
	} );

	it( 'fires the profile_external_clicked Tracks event when the link is clicked', async () => {
		const user = userEvent.setup();
		const onClick = jest.fn();
		render(
			<SocialAnalyticsProvider value={ { source: 'atmosphere', connectionId: 7, onClick } }>
				<SocialProfileCard
					displayName="Alice"
					handle="alice.bsky.social"
					displayNameLink="https://bsky.app/profile/alice.bsky.social"
					stats={ [] }
					statsLabel="Profile stats"
				/>
			</SocialAnalyticsProvider>
		);
		await user.click( screen.getByRole( 'link', { name: 'Alice' } ) );
		expect( onClick ).toHaveBeenCalledWith(
			'calypso_reader_atmosphere_profile_external_clicked',
			expect.objectContaining( {
				connection_id: 7,
				destination: 'external',
				actor_handle: 'alice.bsky.social',
			} )
		);
	} );

	it.each( [
		[ 'javascript: URL', 'javascript:alert(1)' ],
		[ 'data: URL', 'data:text/html,<script>alert(1)</script>' ],
		[ 'protocol-relative URL', '//evil.example/profile' ],
		[ 'whitespace-only string', '   ' ],
		[ 'malformed URL', 'not a url' ],
	] )( 'renders plain heading text when displayNameLink is a %s', ( _label, value ) => {
		render(
			<SocialProfileCard
				displayName="Alice"
				handle="alice.bsky.social"
				displayNameLink={ value }
				stats={ [] }
				statsLabel="Profile stats"
			/>
		);
		expect( screen.queryByRole( 'link', { name: 'Alice' } ) ).not.toBeInTheDocument();
		expect( screen.getByRole( 'heading', { level: 2, name: 'Alice' } ) ).toBeVisible();
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
