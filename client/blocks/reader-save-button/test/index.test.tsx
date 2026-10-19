/**
 * @jest-environment jsdom
 */
import { readSavedKeysQuery } from '@automattic/api-queries';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { recordTrackForPost } from 'calypso/reader/stats';
import ReaderSaveButton from '../index';

jest.mock( 'calypso/reader/stats', () => ( {
	recordAction: jest.fn(),
	recordGaEvent: jest.fn(),
	recordTrackForPost: jest.fn(),
} ) );

const BASE = 'https://public-api.wordpress.com';
const POST = { ID: 1, site_ID: 100, feed_ID: 50, feed_item_ID: 9001, is_external: false };
const SAVED_KEY = { blog_id: 100, post_id: 1, date_saved: '2026-10-01T00:00:00+00:00' };
const WRITE_BODY = { blog_id: 100, post_id: 1, source: 'reader-web' };

function mockKeys( keys: Array< typeof SAVED_KEY > ) {
	return nock( BASE ).get( '/wpcom/v2/read/saved/keys' ).reply( 200, { keys, total: keys.length } );
}

function renderButton() {
	const queryClient = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
	const store = createStore( ( state = {} ) => state );
	const dispatch = jest.spyOn( store, 'dispatch' );

	render(
		<QueryClientProvider client={ queryClient }>
			<Provider store={ store }>
				<ReaderSaveButton post={ POST } />
			</Provider>
		</QueryClientProvider>
	);

	return { dispatch, queryClient };
}

// The button only updates optimistically once the keys are in the cache.
async function renderLoadedButton() {
	const rendered = renderButton();
	await waitFor( () =>
		expect( rendered.queryClient.getQueryData( readSavedKeysQuery().queryKey ) ).toBeDefined()
	);
	return rendered;
}

function expectNotice( dispatch: jest.SpyInstance, text: string ) {
	expect( dispatch ).toHaveBeenCalledWith(
		expect.objectContaining( { notice: expect.objectContaining( { status: 'is-error', text } ) } )
	);
}

beforeEach( () => {
	jest.mocked( recordTrackForPost ).mockClear();
} );

afterEach( () => nock.cleanAll() );

describe( 'ReaderSaveButton', () => {
	it( 'shows that a saved post is saved', async () => {
		mockKeys( [ SAVED_KEY ] );

		renderButton();

		expect( await screen.findByRole( 'button', { name: 'Saved' } ) ).toBeVisible();
	} );

	it( 'saves the post and records the save', async () => {
		const user = userEvent.setup();
		mockKeys( [] );
		const save = nock( BASE )
			.post( '/wpcom/v2/read/saved/new', WRITE_BODY )
			.reply( 200, { saved: true, key: { blog_id: 100, post_id: 1 }, total: 1 } );
		const refetch = mockKeys( [ SAVED_KEY ] );
		await renderLoadedButton();

		await user.click( screen.getByRole( 'button', { name: 'Save to read later' } ) );

		expect( screen.getByRole( 'button', { name: 'Saved' } ) ).toBeVisible();
		await waitFor( () => expect( refetch.isDone() ).toBe( true ) );
		expect( save.isDone() ).toBe( true );
		expect( recordTrackForPost ).toHaveBeenCalledWith( 'calypso_reader_article_saved', POST );
	} );

	it( 'unsaves a saved post and records the unsave', async () => {
		const user = userEvent.setup();
		mockKeys( [ SAVED_KEY ] );
		const unsave = nock( BASE )
			.post( '/wpcom/v2/read/saved/delete', WRITE_BODY )
			.reply( 200, { saved: false, key: { blog_id: 100, post_id: 1 }, total: 0 } );
		const refetch = mockKeys( [] );
		await renderLoadedButton();

		await user.click( screen.getByRole( 'button', { name: 'Saved' } ) );

		expect( screen.getByRole( 'button', { name: 'Save to read later' } ) ).toBeVisible();
		await waitFor( () => expect( refetch.isDone() ).toBe( true ) );
		expect( unsave.isDone() ).toBe( true );
		expect( recordTrackForPost ).toHaveBeenCalledWith( 'calypso_reader_article_unsaved', POST );
	} );

	it( 'ignores clicks while a save is in flight', async () => {
		const user = userEvent.setup();
		mockKeys( [] );
		let finishSave = () => {};
		const saveFinished = new Promise< void >( ( resolve ) => ( finishSave = resolve ) );
		nock( BASE )
			.post( '/wpcom/v2/read/saved/new', WRITE_BODY )
			.reply( async () => {
				await saveFinished;
				return [ 200, { saved: true, key: { blog_id: 100, post_id: 1 }, total: 1 } ];
			} );
		const refetch = mockKeys( [ SAVED_KEY ] );
		await renderLoadedButton();

		await user.click( screen.getByRole( 'button', { name: 'Save to read later' } ) );
		const button = screen.getByRole( 'button', { name: 'Saved' } );
		await waitFor( () => expect( button ).toHaveAttribute( 'aria-disabled', 'true' ) );
		await user.click( button );

		expect( recordTrackForPost ).toHaveBeenCalledTimes( 1 );
		finishSave();
		await waitFor( () => expect( refetch.isDone() ).toBe( true ) );
		await waitFor( () => expect( button ).toHaveAttribute( 'aria-disabled', 'false' ) );
		expect( button ).toHaveAccessibleName( 'Saved' );
	} );

	it( 'shows a notice and restores the button when a save fails', async () => {
		const user = userEvent.setup();
		mockKeys( [] );
		nock( BASE )
			.post( '/wpcom/v2/read/saved/new', WRITE_BODY )
			.reply( 500, { code: 'reader_saved_db_error', message: 'Could not update saved posts.' } );
		mockKeys( [] );
		const { dispatch } = await renderLoadedButton();

		await user.click( screen.getByRole( 'button', { name: 'Save to read later' } ) );

		await waitFor( () =>
			expectNotice( dispatch, 'Sorry, there was a problem saving that post. Please try again.' )
		);
		expect( screen.getByRole( 'button', { name: 'Save to read later' } ) ).toBeVisible();
	} );

	it( 'explains when the saved posts limit is reached', async () => {
		const user = userEvent.setup();
		mockKeys( [] );
		nock( BASE )
			.post( '/wpcom/v2/read/saved/new', WRITE_BODY )
			.reply( 403, { code: 'saved_limit_reached', message: 'Saved posts limit reached.' } );
		mockKeys( [] );
		const { dispatch } = await renderLoadedButton();

		await user.click( screen.getByRole( 'button', { name: 'Save to read later' } ) );

		await waitFor( () =>
			expectNotice( dispatch, 'You’ve saved as many posts as you can. Remove some to save more.' )
		);
		expect( screen.getByRole( 'button', { name: 'Save to read later' } ) ).toBeVisible();
	} );

	it( 'shows a notice and restores the button when an unsave fails', async () => {
		const user = userEvent.setup();
		mockKeys( [ SAVED_KEY ] );
		nock( BASE )
			.post( '/wpcom/v2/read/saved/delete', WRITE_BODY )
			.reply( 500, { code: 'reader_saved_db_error', message: 'Could not update saved posts.' } );
		mockKeys( [ SAVED_KEY ] );
		const { dispatch } = await renderLoadedButton();

		await user.click( screen.getByRole( 'button', { name: 'Saved' } ) );

		await waitFor( () =>
			expectNotice(
				dispatch,
				'Sorry, there was a problem removing that post from Saved. Please try again.'
			)
		);
		expect( screen.getByRole( 'button', { name: 'Saved' } ) ).toBeVisible();
	} );
} );
