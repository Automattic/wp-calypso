/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SocialAnalyticsProvider } from '../analytics-context';
import { PostCardTimestamp } from '../post-card-timestamp';

const basePost = { permalink: '', uri: '' };

describe( 'PostCardTimestamp', () => {
	it( 'renders an absolute time + date in a semantic <time> element', () => {
		const { container } = render(
			<PostCardTimestamp
				post={ { ...basePost, created_at: '2026-04-28T15:17:50Z', indexed_at: '' } }
			/>
		);

		const timeEl = container.querySelector( 'time' );
		expect( timeEl ).not.toBeNull();
		expect( timeEl ).toHaveAttribute( 'dateTime', '2026-04-28T15:17:50Z' );
		// Locale-dependent text — assert the structural pieces (separator + date
		// fragments) instead of a literal "3:17 PM · Apr 28, 2026".
		expect( timeEl?.textContent ).toMatch( /·/ );
		expect( timeEl?.textContent ).toMatch( /Apr/ );
		expect( timeEl?.textContent ).toMatch( /2026/ );
	} );

	it( 'falls back to indexed_at when created_at is empty', () => {
		const { container } = render(
			<PostCardTimestamp
				post={ { ...basePost, created_at: '', indexed_at: '2026-04-28T15:17:50Z' } }
			/>
		);
		expect( container.querySelector( 'time' ) ).toHaveAttribute(
			'dateTime',
			'2026-04-28T15:17:50Z'
		);
	} );

	it( 'renders nothing when both timestamps are empty', () => {
		const { container } = render(
			<PostCardTimestamp post={ { ...basePost, created_at: '', indexed_at: '' } } />
		);
		expect( container.querySelector( 'time' ) ).toBeNull();
	} );

	it( 'renders nothing when the timestamp is unparseable', () => {
		const { container } = render(
			<PostCardTimestamp post={ { ...basePost, created_at: 'not a date', indexed_at: '' } } />
		);
		expect( container.querySelector( 'time' ) ).toBeNull();
	} );

	it( 'renders a bare <time> (no anchor) when permalink is empty', () => {
		const { container } = render(
			<PostCardTimestamp
				post={ { ...basePost, created_at: '2026-04-28T15:17:50Z', indexed_at: '' } }
			/>
		);
		expect( container.querySelector( 'a' ) ).toBeNull();
	} );

	it( 'wraps the <time> in an external anchor when permalink is provided', () => {
		render(
			<PostCardTimestamp
				post={ {
					created_at: '2026-04-28T15:17:50Z',
					indexed_at: '',
					permalink: 'https://bsky.app/profile/example/post/abc',
					uri: 'at://did:plc:example/app.bsky.feed.post/abc',
				} }
			/>
		);
		const link = screen.getByRole( 'link' );
		expect( link ).toHaveAttribute( 'href', 'https://bsky.app/profile/example/post/abc' );
		expect( link ).toHaveAttribute( 'target', '_blank' );
		expect( link ).toHaveAttribute( 'rel', 'noopener noreferrer' );
		expect( link ).toHaveAttribute( 'aria-label', expect.stringContaining( 'opens in a new tab' ) );
		expect( link.querySelector( 'time' ) ).not.toBeNull();
	} );

	it( 'fires the external-post-clicked Tracks event on click', async () => {
		const user = userEvent.setup();
		const onClick = jest.fn();
		render(
			<SocialAnalyticsProvider
				value={ {
					source: 'atmosphere',
					connectionId: 42,
					onClick,
				} }
			>
				<PostCardTimestamp
					post={ {
						created_at: '2026-04-28T15:17:50Z',
						indexed_at: '',
						permalink: 'https://bsky.app/profile/example/post/abc',
						uri: 'at://did:plc:example/app.bsky.feed.post/abc',
					} }
				/>
			</SocialAnalyticsProvider>
		);
		await user.click( screen.getByRole( 'link' ) );
		expect( onClick ).toHaveBeenCalledWith(
			'calypso_reader_atmosphere_timeline_external_post_clicked',
			expect.objectContaining( {
				connection_id: 42,
				post_uri: 'at://did:plc:example/app.bsky.feed.post/abc',
				destination: 'external',
			} )
		);
	} );

	it( 'still renders the link without analytics provider mounted', () => {
		render(
			<PostCardTimestamp
				post={ {
					created_at: '2026-04-28T15:17:50Z',
					indexed_at: '',
					permalink: 'https://example.social/@user/123',
					uri: 'tag:example.social,2026:status/123',
				} }
			/>
		);
		expect( screen.getByRole( 'link' ) ).toHaveAttribute(
			'href',
			'https://example.social/@user/123'
		);
	} );
} );
