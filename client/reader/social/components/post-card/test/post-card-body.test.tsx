/**
 * @jest-environment jsdom
 */
import page from '@automattic/calypso-router';
import { render } from '@testing-library/react';
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

	describe( 'data-id mention interception', () => {
		const onClick = jest.fn();

		function renderWithAnalytics(
			html: string,
			getProfileUrl: ( ref: { id?: string | null } ) => string | null
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
	} );
} );
