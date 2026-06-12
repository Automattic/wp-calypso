/**
 * @jest-environment jsdom
 */
import page from '@automattic/calypso-router';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SocialAnalyticsProvider } from '../analytics-context';
import { PostCardBody } from '../post-card-body';
import type { SocialPost } from '../../../types';

jest.mock( '@automattic/calypso-router', () => jest.fn() );
const pageMock = jest.mocked( page );

function baseHtml( html: string ): SocialPost {
	return {
		uri: 'at://x',
		author: {
			id: 'd',
			handle: 'h.bsky.social',
			display_name: '',
			avatar: null,
			profile_url: 'https://bsky.app/profile/h.bsky.social',
		},
		created_at: '',
		indexed_at: '',
		text: 'hello',
		html,
		lang: [],
		reply_parent: null,
		reply_root: null,
		reason: null,
		embed: null,
		counts: { replies: 0, reposts: 0, likes: 0, quotes: 0 },
		permalink: '',
	};
}

const onClick = jest.fn();

describe( 'PostCardBody', () => {
	it( 'renders the sanitised html via DOMPurify', () => {
		const { container } = render(
			<PostCardBody post={ baseHtml( '<p>hello <strong>x</strong></p>' ) } />
		);
		// strong is stripped by the sanitiser allow-list (only p / br / a allowed)
		expect( container.querySelector( 'p' ) ).not.toBeNull();
		expect( container.querySelector( 'strong' ) ).toBeNull();
	} );

	it( 'falls back to raw text when html is empty', () => {
		const { getByText } = render( <PostCardBody post={ baseHtml( '' ) } /> );
		expect( getByText( 'hello' ) ).toBeVisible();
	} );

	it( 'renders inline body links with target="_blank" and the hardened rel', () => {
		render(
			<PostCardBody post={ baseHtml( '<p>see <a href="https://example.com">site</a></p>' ) } />
		);
		const link = screen.getByRole( 'link', { name: 'site' } );
		expect( link ).toHaveAttribute( 'target', '_blank' );
		const rel = link.getAttribute( 'rel' ) ?? '';
		expect( rel ).toContain( 'nofollow' );
		expect( rel ).toContain( 'noopener' );
		expect( rel ).toContain( 'noreferrer' );
	} );

	it( 'preserves the link href verbatim', () => {
		render(
			<PostCardBody post={ baseHtml( '<p><a href="https://example.com/path?q=1">x</a></p>' ) } />
		);
		const link = screen.getByRole( 'link', { name: 'x' } );
		expect( link ).toHaveAttribute( 'href', 'https://example.com/path?q=1' );
	} );

	describe( 'data-id mention interception', () => {
		function renderWithAnalytics(
			html: string,
			getProfileUrl: ( ref: {
				id?: string | null;
				handle?: string | null;
				did?: string | null;
			} ) => string | null
		) {
			return render(
				<SocialAnalyticsProvider
					value={ {
						source: 'mastodon',
						connectionId: 7,
						onClick,
						getProfileUrl,
					} }
				>
					<PostCardBody post={ baseHtml( html ) } />
				</SocialAnalyticsProvider>
			);
		}

		beforeEach( () => {
			pageMock.mockClear();
			onClick.mockClear();
		} );

		it( 'routes the click in-app when data-id resolves to an in-app URL', async () => {
			const user = userEvent.setup();
			const getProfileUrl = jest.fn( ( ref ) =>
				ref.id ? `/reader/mastodon/7/profile/${ ref.id }` : null
			);
			const { getByText } = renderWithAnalytics(
				'<p><a href="https://mastodon.social/@alice" data-id="108020">@alice</a></p>',
				getProfileUrl
			);
			await user.click( getByText( '@alice' ) );
			expect( pageMock ).toHaveBeenCalledWith( '/reader/mastodon/7/profile/108020' );
		} );

		it( 'leaves anchors without data-id alone (no in-app routing)', async () => {
			const user = userEvent.setup();
			const getProfileUrl = jest.fn( () => '/reader/mastodon/7/profile/108020' );
			const { getByText } = renderWithAnalytics(
				'<p><a href="https://mastodon.social/@alice">@alice</a></p>',
				getProfileUrl
			);
			await user.click( getByText( '@alice' ) );
			expect( pageMock ).not.toHaveBeenCalled();
			expect( getProfileUrl ).not.toHaveBeenCalled();
		} );

		it( 'fires *_mention_unresolved Tracks when data-id is present but resolver returns null', async () => {
			const user = userEvent.setup();
			const getProfileUrl = jest.fn( () => null );
			const { getByText } = renderWithAnalytics(
				'<p><a href="https://mastodon.social/@alice" data-id="bogus">@alice</a></p>',
				getProfileUrl
			);
			await user.click( getByText( '@alice' ) );
			expect( pageMock ).not.toHaveBeenCalled();
			expect( onClick ).toHaveBeenCalledWith(
				'calypso_reader_mastodon_timeline_mention_unresolved',
				expect.objectContaining( { connection_id: 7, data_id: 'bogus' } )
			);
		} );

		it( 'passes data-id as handle, did, and id so atmosphere-style resolvers can validate', async () => {
			// Regression: when the backend stamps a *handle* in data-id (no DID
			// available), atmosphere's resolver only validates `ref.handle`
			// against HANDLE_RE — the click handler must populate all three
			// fields so the resolver picks whichever it understands.
			const user = userEvent.setup();
			const getProfileUrl = jest.fn( ( ref: { handle?: string | null } ) =>
				ref.handle ? `/reader/atmosphere/7/profile/${ ref.handle }` : null
			);
			const { getByText } = renderWithAnalytics(
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

		it( 'passes through modifier-clicks (cmd) so users can open in a new tab', async () => {
			const user = userEvent.setup();
			const getProfileUrl = jest.fn( ( ref ) =>
				ref.id ? `/reader/mastodon/7/profile/${ ref.id }` : null
			);
			const { getByText } = renderWithAnalytics(
				'<p><a href="https://mastodon.social/@alice" data-id="108020">@alice</a></p>',
				getProfileUrl
			);
			await user.keyboard( '[MetaLeft>]' );
			await user.click( getByText( '@alice' ) );
			await user.keyboard( '[/MetaLeft]' );
			expect( pageMock ).not.toHaveBeenCalled();
		} );

		it( 'passes data-handle as ref.handle separately from data-id (CM-725 Fediverse / Mastodon)', async () => {
			// When the backend stamps both `data-id` (canonical id — actor URL
			// for Fediverse, numeric for Mastodon) and `data-handle`
			// (webfinger), the click handler routes them to distinct fields so
			// per-protocol resolvers can build a clean user-readable URL from
			// the handle rather than the raw id.
			const user = userEvent.setup();
			const getProfileUrl = jest.fn( ( ref: { handle?: string | null } ) =>
				ref.handle ? `/reader/fediverse/7/profile/${ ref.handle }` : null
			);
			const { getByText } = renderWithAnalytics(
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

		it( 'routes when only data-handle is present (no data-id) — pure-webfinger anchor', async () => {
			const user = userEvent.setup();
			const getProfileUrl = jest.fn( ( ref: { handle?: string | null } ) =>
				ref.handle ? `/reader/fediverse/7/profile/${ ref.handle }` : null
			);
			const { getByText } = renderWithAnalytics(
				'<p><a href="https://example.com/@alice"' +
					' data-handle="alice@example.com">@alice</a></p>',
				getProfileUrl
			);
			await user.click( getByText( '@alice' ) );
			expect( pageMock ).toHaveBeenCalledWith( '/reader/fediverse/7/profile/alice@example.com' );
		} );

		it( 'includes data_handle on the unresolved Tracks payload when present', async () => {
			const user = userEvent.setup();
			const getProfileUrl = jest.fn( () => null );
			const { getByText } = renderWithAnalytics(
				'<p><a href="https://example.com/@alice"' +
					' data-id="https://example.com/users/alice"' +
					' data-handle="alice@example.com">@alice</a></p>',
				getProfileUrl
			);
			await user.click( getByText( '@alice' ) );
			expect( onClick ).toHaveBeenCalledWith(
				'calypso_reader_mastodon_timeline_mention_unresolved',
				expect.objectContaining( {
					connection_id: 7,
					data_id: 'https://example.com/users/alice',
					data_handle: 'alice@example.com',
				} )
			);
		} );

		it( 'is a no-op when no analytics provider is in scope (slim layout)', async () => {
			// Defensive guard: when the body is rendered outside a
			// `<SocialAnalyticsProvider>` (tests, embedded contexts), the
			// click handler must short-circuit without throwing. The
			// optional-chained resolver call already returns null on its own,
			// but the explicit `if ( ! analytics ) return;` keeps the warn /
			// tracks path on the safe side of any future refactor that drops
			// the optional chain on `analytics.source` / `connectionId`.
			const user = userEvent.setup();
			const { getByText } = render(
				<PostCardBody
					post={ baseHtml(
						'<p><a href="https://example.com/@alice"' +
							' data-id="https://example.com/users/alice"' +
							' data-handle="alice@example.com">@alice</a></p>'
					) }
				/>
			);
			await user.click( getByText( '@alice' ) );
			expect( pageMock ).not.toHaveBeenCalled();
			expect( onClick ).not.toHaveBeenCalled();
		} );
	} );

	describe( 'data-tag hashtag interception', () => {
		beforeEach( () => {
			pageMock.mockClear();
			onClick.mockClear();
		} );

		function renderWithGetTagUrl( html: string, getTagUrl: ( tag: string ) => string | null ) {
			return render(
				<SocialAnalyticsProvider
					value={ { source: 'mastodon', connectionId: 7, onClick, getTagUrl } }
				>
					<PostCardBody post={ baseHtml( html ) } />
				</SocialAnalyticsProvider>
			);
		}

		it( 'routes the click in-app when data-tag resolves', async () => {
			const user = userEvent.setup();
			const getTagUrl = jest.fn( ( tag ) => `/reader/mastodon/7/tag/${ tag }` );
			const { getByText } = renderWithGetTagUrl(
				'<p><a href="https://mastodon.social/tags/rust" data-tag="rust">#rust</a></p>',
				getTagUrl
			);
			await user.click( getByText( '#rust' ) );
			expect( pageMock ).toHaveBeenCalledWith( '/reader/mastodon/7/tag/rust' );
		} );

		it( 'fires *_timeline_tag_unresolved Tracks when resolver returns null', async () => {
			const user = userEvent.setup();
			const getTagUrl = jest.fn( () => null );
			const { getByText } = renderWithGetTagUrl(
				'<p><a href="https://mastodon.social/tags/x" data-tag="bogus">#x</a></p>',
				getTagUrl
			);
			await user.click( getByText( '#x' ) );
			expect( pageMock ).not.toHaveBeenCalled();
			expect( onClick ).toHaveBeenCalledWith(
				'calypso_reader_mastodon_timeline_tag_unresolved',
				expect.objectContaining( { connection_id: 7, data_tag: 'bogus' } )
			);
		} );

		it( 'data-id takes precedence when both attributes are on the same anchor', async () => {
			const user = userEvent.setup();
			const getProfileUrl = jest.fn( ( ref ) =>
				ref.id ? `/reader/mastodon/7/profile/${ ref.id }` : null
			);
			const getTagUrl = jest.fn( () => '/reader/mastodon/7/tag/wrong' );
			const { getByText } = render(
				<SocialAnalyticsProvider
					value={ {
						source: 'mastodon',
						connectionId: 7,
						onClick,
						getProfileUrl,
						getTagUrl,
					} }
				>
					<PostCardBody
						post={ baseHtml(
							'<p><a href="https://mastodon.social/@alice" data-id="108020" data-tag="rust">@alice</a></p>'
						) }
					/>
				</SocialAnalyticsProvider>
			);
			await user.click( getByText( '@alice' ) );
			expect( pageMock ).toHaveBeenCalledWith( '/reader/mastodon/7/profile/108020' );
			expect( getTagUrl ).not.toHaveBeenCalled();
		} );
	} );
} );
