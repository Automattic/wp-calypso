/**
 * @jest-environment jsdom
 */
import { QueryClient } from '@tanstack/react-query';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { SocialAnalyticsProvider } from '../analytics-context';
import { BlogAboutButton } from '../blog-about-button';
import type { SocialPost } from '../../../types';

jest.mock( 'calypso/lib/logstash', () => ( { logToLogstash: jest.fn() } ) );

const ORIGIN = 'https://public-api.wordpress.com';

const post = {
	uri: 'at://did:plc:foo/app.bsky.feed.post/abc',
	permalink: 'https://bsky.app/profile/foo.bsky.social/post/abc',
	text: 'hi',
	html: '<p>hi</p>',
	author: {
		id: 'did:plc:foo',
		handle: 'foo.bsky.social',
		display_name: 'Foo',
		avatar: null,
		profile_url: '',
	},
	counts: { replies: 0, reposts: 0, likes: 0, quotes: 0 },
	created_at: '',
	indexed_at: null,
	lang: [],
	reply_parent: null,
	reply_root: null,
	reason: null,
	embed: null,
} as SocialPost;

afterEach( () => nock.cleanAll() );

describe( 'BlogAboutButton', () => {
	it( 'renders an accessible button with the wordpress logomark', () => {
		renderWithProvider(
			<SocialAnalyticsProvider
				value={ { source: 'atmosphere', connectionId: 1, onClick: () => {} } }
			>
				<BlogAboutButton post={ post } />
			</SocialAnalyticsProvider>,
			{ queryClient: new QueryClient( { defaultOptions: { queries: { retry: false } } } ) }
		);
		expect( screen.getByRole( 'button', { name: /Blog about this post/i } ) ).toBeVisible();
	} );

	it( 'fires _blog_about_clicked and opens the modal on click', async () => {
		const user = userEvent.setup();
		const onClick = jest.fn();
		nock( ORIGIN )
			.get( /\/rest\/v1\.\d+\/me\/sites/ )
			.reply( 200, { sites: [] } );

		renderWithProvider(
			<SocialAnalyticsProvider value={ { source: 'atmosphere', connectionId: 1, onClick } }>
				<BlogAboutButton post={ post } />
			</SocialAnalyticsProvider>,
			{ queryClient: new QueryClient( { defaultOptions: { queries: { retry: false } } } ) }
		);

		await user.click( screen.getByRole( 'button', { name: /Blog about this post/i } ) );

		expect(
			onClick.mock.calls.find( ( c ) => c[ 0 ] === 'calypso_reader_atmosphere_blog_about_clicked' )
		).toBeDefined();
		expect( await screen.findByRole( 'dialog', { name: /Blog about this post/i } ) ).toBeVisible();
	} );
} );
