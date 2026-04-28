/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SocialAnalyticsProvider } from '../analytics-context';
import { PostCardCounts } from '../post-card-counts';
import type { AtmosphereCounts } from '@automattic/api-core';

const counts: AtmosphereCounts = { replies: 5, reposts: 2, likes: 9, quotes: 1 };

function wrap(
	ui: React.ReactNode,
	getThreadUrl?: ( uri: string ) => string | null,
	onClick = jest.fn()
) {
	return (
		<SocialAnalyticsProvider
			value={ {
				source: 'atmosphere',
				connectionId: 7,
				onClick,
				getThreadUrl,
			} }
		>
			{ ui }
		</SocialAnalyticsProvider>
	);
}

describe( 'PostCardCounts', () => {
	it( 'renders all four counts as static spans when no resolver is set', () => {
		render( wrap( <PostCardCounts counts={ counts } postUri="at://x" /> ) );
		expect( screen.queryByRole( 'link' ) ).toBeNull();
	} );

	it( 'renders the replies count as a link when getThreadUrl returns a string', () => {
		const getThreadUrl = () => '/reader/atmosphere/7/thread/did:plc:abc/3kabc';
		render(
			wrap(
				<PostCardCounts counts={ counts } postUri="at://did:plc:abc/app.bsky.feed.post/3kabc" />,
				getThreadUrl
			)
		);
		const link = screen.getByRole( 'link', { name: /replies/i } );
		expect( link ).toHaveAttribute( 'href', '/reader/atmosphere/7/thread/did:plc:abc/3kabc' );
		expect( link ).toHaveTextContent( '5' );
	} );

	it( 'fires _replies_count_clicked when the replies link is clicked', async () => {
		const onClick = jest.fn();
		const getThreadUrl = () => '/reader/atmosphere/7/thread/did:plc:abc/3kabc';
		render(
			wrap(
				<PostCardCounts counts={ counts } postUri="at://did:plc:abc/app.bsky.feed.post/3kabc" />,
				getThreadUrl,
				onClick
			)
		);
		const user = userEvent.setup();
		await user.click( screen.getByRole( 'link', { name: /replies/i } ) );
		expect( onClick ).toHaveBeenCalledWith(
			expect.stringContaining( '_replies_count_clicked' ),
			expect.objectContaining( {
				connection_id: 7,
				post_uri: 'at://did:plc:abc/app.bsky.feed.post/3kabc',
				replies_count: 5,
				destination: 'in_app_thread',
			} )
		);
	} );

	it( 'reposts/likes/quotes stay non-interactive even when getThreadUrl is set', () => {
		const getThreadUrl = () => '/reader/atmosphere/7/thread/did:plc:abc/3kabc';
		render( wrap( <PostCardCounts counts={ counts } postUri="at://x" />, getThreadUrl ) );
		const links = screen.getAllByRole( 'link' );
		expect( links ).toHaveLength( 1 ); // only replies
	} );
} );
