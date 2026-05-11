/**
 * @jest-environment jsdom
 */
import { QueryClient } from '@tanstack/react-query';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import * as analytics from 'calypso/state/reader/analytics/actions';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { SocialAnalyticsProvider } from '../analytics-context';
import { BlogAboutModal } from '../blog-about-modal';
import type { SocialPost } from '../../../types';
import type { ReactNode } from 'react';

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

function withAnalytics( children: ReactNode ) {
	return (
		<SocialAnalyticsProvider
			value={ {
				source: 'atmosphere',
				connectionId: 1,
				onClick: () => {},
			} }
		>
			{ children }
		</SocialAnalyticsProvider>
	);
}

afterEach( () => nock.cleanAll() );

describe( 'BlogAboutModal', () => {
	it( 'shows a single-site handoff when the user has exactly one site', async () => {
		nock( ORIGIN )
			.get( /\/rest\/v1\.\d+\/me\/sites/ )
			.reply( 200, {
				sites: [
					{
						ID: 100,
						name: 'My Blog',
						slug: 'myblog.wordpress.com',
						URL: 'https://myblog.wordpress.com',
						options: { admin_url: 'https://myblog.wordpress.com/wp-admin/' },
						site_migration: { in_progress: false, is_complete: false },
					},
				],
			} );

		renderWithProvider( withAnalytics( <BlogAboutModal post={ post } onClose={ () => {} } /> ), {
			queryClient: new QueryClient( { defaultOptions: { queries: { retry: false } } } ),
		} );

		expect( await screen.findByText( /Publish on My Blog/i ) ).toBeVisible();
		expect( screen.getByRole( 'button', { name: /Start writing/i } ) ).toBeVisible();
		expect( screen.getByRole( 'heading', { name: /Blog about this post/i } ) ).toBeVisible();
	} );

	it( 'shows the Create-a-site CTA when the user has no sites', async () => {
		nock( ORIGIN )
			.get( /\/rest\/v1\.\d+\/me\/sites/ )
			.reply( 200, { sites: [] } );

		renderWithProvider( withAnalytics( <BlogAboutModal post={ post } onClose={ () => {} } /> ), {
			queryClient: new QueryClient( { defaultOptions: { queries: { retry: false } } } ),
		} );

		expect( await screen.findByRole( 'link', { name: /Create a site/i } ) ).toHaveAttribute(
			'href',
			'/start'
		);
	} );

	it( 'fires _blog_about_shown with the site_count after sites resolve', async () => {
		nock( ORIGIN )
			.get( /\/rest\/v1\.\d+\/me\/sites/ )
			.reply( 200, {
				sites: [
					{
						ID: 100,
						name: 'My Blog',
						slug: 'myblog.wordpress.com',
						URL: 'https://myblog.wordpress.com',
						options: { admin_url: 'https://myblog.wordpress.com/wp-admin/' },
						site_migration: { in_progress: false, is_complete: false },
					},
				],
			} );

		const onClick = jest.fn();
		renderWithProvider(
			<SocialAnalyticsProvider value={ { source: 'atmosphere', connectionId: 1, onClick } }>
				<BlogAboutModal post={ post } onClose={ () => {} } />
			</SocialAnalyticsProvider>,
			{ queryClient: new QueryClient( { defaultOptions: { queries: { retry: false } } } ) }
		);

		await screen.findByText( /Publish on My Blog/i );
		const shownCall = onClick.mock.calls.find(
			( c ) => c[ 0 ] === 'calypso_reader_atmosphere_blog_about_shown'
		);
		expect( shownCall ).toBeDefined();
		expect( shownCall![ 1 ] ).toMatchObject( { post_uri: post.uri, site_count: 1 } );
	} );

	it( 'fires _blog_about_dismissed when closed without submitting', async () => {
		const user = userEvent.setup();
		nock( ORIGIN )
			.get( /\/rest\/v1\.\d+\/me\/sites/ )
			.reply( 200, { sites: [] } );

		const onClick = jest.fn();
		const onClose = jest.fn();
		renderWithProvider(
			<SocialAnalyticsProvider value={ { source: 'atmosphere', connectionId: 1, onClick } }>
				<BlogAboutModal post={ post } onClose={ onClose } />
			</SocialAnalyticsProvider>,
			{ queryClient: new QueryClient( { defaultOptions: { queries: { retry: false } } } ) }
		);

		const closeButton = await screen.findByRole( 'button', { name: /close/i } );
		await user.click( closeButton );
		await waitFor( () => expect( onClose ).toHaveBeenCalled() );
		expect(
			onClick.mock.calls.find(
				( c ) => c[ 0 ] === 'calypso_reader_atmosphere_blog_about_dismissed'
			)
		).toBeDefined();
	} );

	it( 'closes the modal after a successful handoff without firing _dismissed', async () => {
		const user = userEvent.setup();
		const openSpy = jest.spyOn( window, 'open' ).mockImplementation( () => null );
		const recordSpy = jest
			.spyOn( analytics, 'recordReaderTracksEvent' )
			.mockImplementation( () => ( { type: '@@TEST/NOOP' } ) as never );

		nock( ORIGIN )
			.get( /\/rest\/v1\.\d+\/me\/sites/ )
			.reply( 200, {
				sites: [
					{
						ID: 100,
						name: 'My Blog',
						slug: 'myblog.wordpress.com',
						URL: 'https://myblog.wordpress.com',
						options: { admin_url: 'https://myblog.wordpress.com/wp-admin/' },
						site_migration: { in_progress: false, is_complete: false },
					},
				],
			} );
		nock( ORIGIN )
			.post( /\/rest\/v1\.\d+\/sites\/100\/posts\/new/ )
			.reply( 200, { ID: 555 } );

		const onClick = jest.fn();
		const onClose = jest.fn();
		renderWithProvider(
			<SocialAnalyticsProvider value={ { source: 'atmosphere', connectionId: 1, onClick } }>
				<BlogAboutModal post={ post } onClose={ onClose } />
			</SocialAnalyticsProvider>,
			{ queryClient: new QueryClient( { defaultOptions: { queries: { retry: false } } } ) }
		);

		const button = await screen.findByRole( 'button', { name: /Start writing/i } );
		await user.click( button );

		await waitFor( () => expect( onClose ).toHaveBeenCalled() );

		expect(
			onClick.mock.calls.find(
				( c ) => c[ 0 ] === 'calypso_reader_atmosphere_blog_about_dismissed'
			)
		).toBeUndefined();

		openSpy.mockRestore();
		recordSpy.mockRestore();
	} );

	it( 'fires _blog_about_editor_opened via SiteHandoff on submit', async () => {
		const user = userEvent.setup();
		const openSpy = jest.spyOn( window, 'open' ).mockImplementation( () => null );
		const recordSpy = jest
			.spyOn( analytics, 'recordReaderTracksEvent' )
			.mockImplementation( () => ( { type: '@@TEST/NOOP' } ) as never );

		nock( ORIGIN )
			.get( /\/rest\/v1\.\d+\/me\/sites/ )
			.reply( 200, {
				sites: [
					{
						ID: 100,
						name: 'My Blog',
						slug: 'myblog.wordpress.com',
						URL: 'https://myblog.wordpress.com',
						options: { admin_url: 'https://myblog.wordpress.com/wp-admin/' },
						site_migration: { in_progress: false, is_complete: false },
					},
				],
			} );
		nock( ORIGIN )
			.post( /\/rest\/v1\.\d+\/sites\/100\/posts\/new/ )
			.reply( 200, { ID: 555 } );

		renderWithProvider( withAnalytics( <BlogAboutModal post={ post } onClose={ () => {} } /> ), {
			queryClient: new QueryClient( { defaultOptions: { queries: { retry: false } } } ),
		} );

		const button = await screen.findByRole( 'button', { name: /Start writing/i } );
		await user.click( button );

		await waitFor( () =>
			expect(
				recordSpy.mock.calls.find(
					( c ) => c[ 0 ] === 'calypso_reader_atmosphere_blog_about_editor_opened'
				)
			).toBeDefined()
		);

		openSpy.mockRestore();
		recordSpy.mockRestore();
	} );
} );
