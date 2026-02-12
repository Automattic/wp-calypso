/**
 * @jest-environment jsdom
 */
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import { useRecordReaderTracksEvent } from 'calypso/state/reader/analytics/useRecordReaderTracksEvent';
import getPrimarySiteId from 'calypso/state/selectors/get-primary-site-id';
import hasLoadedSites from 'calypso/state/selectors/has-loaded-sites';
import { getSiteAdminUrl } from 'calypso/state/sites/selectors';
import { getMostRecentlySelectedSiteId, getSelectedSiteId } from 'calypso/state/ui/selectors';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import QuickPost from '../index';

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
		addApiMiddleware: jest.fn(),
	};
} );

jest.mock( '@wordpress/blocks', () => ( {
	parse: jest.fn().mockReturnValue( {
		content: 'Test post',
	} ),
	createBlock: jest.fn(),
	serialize: jest.fn(),
	unregisterBlockType: jest.fn(),
} ) );

jest.mock( '@wordpress/block-library/build-module/heading', () => {
	return {
		name: 'core/heading',
	};
} );

jest.mock( 'calypso/state/current-user/selectors', () => ( {
	getCurrentUser: jest.fn(),
} ) );
jest.mock( 'calypso/state/selectors/get-primary-site-id', () => ( {
	__esModule: true,
	default: jest.fn(),
} ) );
jest.mock( 'calypso/state/selectors/has-loaded-sites', () => ( {
	__esModule: true,
	default: jest.fn(),
} ) );
jest.mock( 'calypso/state/sites/selectors', () => ( {
	getSiteAdminUrl: jest.fn(),
	getSite: jest.fn(),
} ) );
jest.mock( 'calypso/state/ui/selectors', () => ( {
	getMostRecentlySelectedSiteId: jest.fn(),
	getSelectedSiteId: jest.fn(),
} ) );

jest.mock( 'calypso/state/reader/analytics/useRecordReaderTracksEvent', () => ( {
	useRecordReaderTracksEvent: jest.fn( () => jest.fn() ),
} ) );

const mockSavePostApi = ( type: 'publish' | 'draft' ) => {
	return nock( 'https://public-api.wordpress.com:443' )
		.post( '/rest/v1.1/sites/123/posts/new', {
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

		( getCurrentUser as jest.Mock ).mockReturnValue( { site_count: 1 } );
		( getSelectedSiteId as jest.Mock ).mockReturnValue( 123 );
		( getMostRecentlySelectedSiteId as jest.Mock ).mockReturnValue( null );
		( getPrimarySiteId as jest.Mock ).mockReturnValue( null );
		( hasLoadedSites as jest.Mock ).mockReturnValue( true );
		( getSiteAdminUrl as jest.Mock ).mockReturnValue( 'https://example.com/wp-admin' );
	} );

	it( 'renders when selectors indicate sites are loaded and user has sites', () => {
		const { getByRole } = renderWithProvider( <QuickPost /> );
		expect( getByRole( 'button', { name: 'Post' } ) ).toBeVisible();
	} );

	it( 'saves the post when clicks on the Post button', async () => {
		mockSavePostApi( 'publish' );

		renderWithProvider( <QuickPost /> );
		await userEvent.type(
			screen.getByRole( 'textbox', { name: 'Quick post editor' } ),
			'Test post'
		);
		await userEvent.click( screen.getByRole( 'button', { name: 'Post' } ) );

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
		mockSavePostApi( 'publish' );

		const mockTrackEvent = jest.fn();
		( useRecordReaderTracksEvent as jest.Mock ).mockReturnValue( mockTrackEvent );

		renderWithProvider( <QuickPost /> );
		await userEvent.type(
			screen.getByRole( 'textbox', { name: 'Quick post editor' } ),
			'Test post'
		);
		await userEvent.click( screen.getByRole( 'button', { name: 'Post' } ) );

		await waitFor( async () => {
			expect( mockTrackEvent ).toHaveBeenCalledWith( 'calypso_reader_quick_post_submitted', {
				post_id: 1234,
				post_url: 'https://example.com/test-post',
				site_id: 123,
			} );
		} );
	} );

	it( 'shows an error notice when the post is not saved', async () => {
		nock( 'https://public-api.wordpress.com:443' )
			.post( '/rest/v1.1/sites/123/posts/new', {
				content: 'Test post',
				status: 'publish',
			} )
			.reply( 500, { error: 'Internal Server Error' } );

		renderWithProvider( <QuickPost /> );

		await userEvent.type(
			screen.getByRole( 'textbox', { name: 'Quick post editor' } ),
			'Test post'
		);
		await userEvent.click( screen.getByRole( 'button', { name: 'Post' } ) );

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
		mockSavePostApi( 'draft' );

		const mockTrackEvent = jest.fn();
		( useRecordReaderTracksEvent as jest.Mock ).mockReturnValue( mockTrackEvent );

		renderWithProvider( <QuickPost /> );

		await userEvent.type(
			screen.getByRole( 'textbox', { name: 'Quick post editor' } ),
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
