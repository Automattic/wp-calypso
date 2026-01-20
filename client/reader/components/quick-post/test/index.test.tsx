/**
 * @jest-environment jsdom
 */
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { Suspense } from 'react';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import { useRecordReaderTracksEvent } from 'calypso/state/reader/analytics/useRecordReaderTracksEvent';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import QuickPost from '../index';

jest.mock( '@wordpress/blocks', () => ( {
	parse: jest.fn().mockReturnValue( {
		content: 'Test post',
	} ),
	createBlock: jest.fn(),
	serialize: jest.fn(),
	unregisterBlockType: jest.fn(),
} ) );

jest.mock( '../utils', () => ( {
	focusEditor: jest.fn(),
} ) );

jest.mock( 'calypso/state/notices/actions', () => ( {
	successNotice: jest.fn( () => ( {
		type: 'success',
		text: 'Post successful! Your post will appear in the feed soon.',
	} ) ),
	errorNotice: jest.fn( () => ( {
		type: 'error',
		text: 'Sorry, something went wrong. Please try again.',
	} ) ),
	warningNotice: jest.fn( () => ( {
		type: 'warning',
		text: 'Please select a site.',
	} ) ),
} ) );

jest.mock( '@automattic/verbum-block-editor', () => {
	return {
		Editor: ( {
			initialContent,
			onChange,
		}: {
			initialContent: string;
			onChange: ( v: string ) => void;
		} ) => (
			<input
				type="text"
				aria-label="Quick post editor"
				defaultValue={ initialContent }
				onChange={ ( e ) => onChange( e.target.value ) }
			/>
		),
		loadBlocksWithCustomizations: jest.fn(),
		loadTextFormatting: jest.fn(),
	};
} );

jest.mock( '@wordpress/block-library/build-module/heading', () => {
	return {
		name: 'core/heading',
	};
} );

jest.mock( 'calypso/state/reader/analytics/useRecordReaderTracksEvent', () => ( {
	useRecordReaderTracksEvent: jest.fn( () => jest.fn() ),
} ) );

const mockGetSitesApi = () => {
	return nock( 'https://public-api.wordpress.com:443' )
		.get( '/rest/v1.2/me/sites' )
		.query( true )
		.once()
		.reply( 200, {
			sites: [
				{
					ID: 123,
					name: 'Test Site',
					URL: 'https://example.com',
					options: {
						admin_url: 'https://example.com/wp-admin',
					},
					site_migration: {
						migration_status: 'completed',
						in_progress: false,
						is_complete: true,
					},
				},
			],
		} );
};

const mockSavePostApi = ( type: 'publish' | 'draft' ) => {
	return nock( 'https://public-api.wordpress.com:443' )
		.post( '/rest/v1.1/sites/123/posts/new', {
			title: 'Test post...',
			content: 'Test post',
			status: type,
		} )
		.once()
		.reply( 200, { ID: 1234, URL: 'https://example.com/test-post' } );
};

describe( 'QuickPost', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		localStorage.clear();
		nock.disableNetConnect();

		Object.defineProperty( window, 'location', {
			value: {
				assign: jest.fn(),
			},
			writable: true,
		} );
	} );

	it( 'renders quick component when sites are loaded', async () => {
		const getApi = mockGetSitesApi();

		renderWithProvider(
			<Suspense fallback={ <div>Loading...</div> }>
				<QuickPost />
			</Suspense>
		);
		await waitFor( () => {
			expect( getApi.isDone() ).toBe( true );
			expect( screen.getByRole( 'button', { name: 'Post' } ) ).toBeInTheDocument();
		} );
	} );

	it( 'saves the post when clicks on the publish button', async () => {
		mockGetSitesApi();
		mockSavePostApi( 'publish' );

		renderWithProvider( <QuickPost /> );

		await userEvent.type(
			await screen.findByRole( 'textbox', { name: 'Quick post editor' } ),
			'Test post'
		);

		await userEvent.click( await screen.findByRole( 'button', { name: 'Post' } ) );

		await waitFor( async () => {
			expect( successNotice ).toHaveBeenCalledWith(
				'Post successful! Your post will appear in the feed soon.',
				{
					button: 'View Post.',
					onClick: expect.any( Function ),
				}
			);
		} );
	} );

	it( 'tracks the event when the post is saved', async () => {
		mockGetSitesApi();
		mockSavePostApi( 'publish' );

		const mockTrackEvent = jest.fn();
		( useRecordReaderTracksEvent as jest.Mock ).mockReturnValue( mockTrackEvent );

		renderWithProvider( <QuickPost /> );

		await userEvent.type(
			await screen.findByRole( 'textbox', { name: 'Quick post editor' } ),
			'Test post'
		);
		await userEvent.click( await screen.findByRole( 'button', { name: 'Post' } ) );

		await waitFor( async () => {
			expect( mockTrackEvent ).toHaveBeenCalledWith( 'calypso_reader_quick_post_submitted', {
				post_id: 1234,
				post_url: 'https://example.com/test-post',
				site_id: 123,
			} );
		} );
	} );

	it( 'shows an error notice when the post is not saved', async () => {
		mockGetSitesApi();
		nock( 'https://public-api.wordpress.com:443' )
			.post( '/rest/v1.1/sites/123/posts/new', {
				title: 'Test post...',
				content: 'Test post',
				status: 'publish',
			} )
			.reply( 500, { error: 'Internal Server Error' } );

		renderWithProvider( <QuickPost /> );

		await userEvent.type(
			await screen.findByRole( 'textbox', { name: 'Quick post editor' } ),
			'Test post'
		);
		await userEvent.click( await screen.findByRole( 'button', { name: 'Post' } ) );

		await waitFor( async () => {
			expect( errorNotice ).toHaveBeenCalledWith(
				'Sorry, something went wrong. Please try again.',
				{
					duration: 5000,
				}
			);
		} );
	} );

	it( 'redirects to the full editor when the post is saved', async () => {
		mockGetSitesApi();
		mockSavePostApi( 'draft' );
		const mockTrackEvent = jest.fn();
		( useRecordReaderTracksEvent as jest.Mock ).mockReturnValue( mockTrackEvent );

		renderWithProvider( <QuickPost /> );

		await userEvent.type(
			await screen.findByRole( 'textbox', { name: 'Quick post editor' } ),
			'Test post'
		);

		await userEvent.click(
			await screen.findByRole( 'button', { name: 'Edit using the full editor.' } )
		);

		await waitFor( async () => {
			expect( window.location.assign ).toHaveBeenCalledWith(
				'https://example.com/wp-admin/post.php?post=1234&action=edit'
			);
			expect( mockTrackEvent ).toHaveBeenCalledWith(
				'calypso_reader_quick_post_full_editor_opened'
			);
		} );
	} );
} );
