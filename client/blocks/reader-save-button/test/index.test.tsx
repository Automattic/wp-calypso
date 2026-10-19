/**
 * @jest-environment jsdom
 */
import { readSavedKeysQuery } from '@automattic/api-queries';
import { QueryClient } from '@tanstack/react-query';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { createStore } from 'redux';
import { recordTrackForPost } from 'calypso/reader/stats';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import ReaderSaveButton from '../index';

jest.mock( 'calypso/reader/stats', () => ( {
	recordAction: jest.fn(),
	recordGaEvent: jest.fn(),
	recordTrackForPost: jest.fn(),
} ) );

const BASE = 'https://public-api.wordpress.com';
const KEYS_PATH = '/wpcom/v2/read/saved/keys';
const POST = { ID: 1, site_ID: 100, feed_ID: 50, feed_item_ID: 9001, is_external: false };
const SAVED_KEY = { blog_id: 100, post_id: 1, date_saved: '2026-10-01T00:00:00+00:00' };
const WRITE_BODY = { blog_id: 100, post_id: 1, source: 'reader-web' };

// Pass `times: 2` to cover the refetch after a save or unsave settles.
function mockKeys( keys: Array< typeof SAVED_KEY >, times = 1 ) {
	return nock( BASE ).get( KEYS_PATH ).times( times ).reply( 200, { keys, total: keys.length } );
}

function writeResponse( action: 'new' | 'delete' ) {
	return {
		saved: action === 'new',
		key: { blog_id: 100, post_id: 1 },
		total: action === 'new' ? 1 : 0,
	};
}

function mockWrite(
	action: 'new' | 'delete',
	status = 200,
	body: object = writeResponse( action )
) {
	return nock( BASE ).post( `/wpcom/v2/read/saved/${ action }`, WRITE_BODY ).reply( status, body );
}

// A reply that waits until `finish()` is called.
function deferredReply( body: object ) {
	let finish = () => {};
	const finished = new Promise< void >( ( resolve ) => ( finish = resolve ) );
	return {
		reply: async (): Promise< [ number, object ] > => {
			await finished;
			return [ 200, body ];
		},
		finish: () => finish(),
	};
}

function renderButton() {
	const queryClient = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
	const store = createStore( ( state = {} ) => state );
	const dispatch = jest.spyOn( store, 'dispatch' );

	renderWithProvider( <ReaderSaveButton post={ POST } />, { store, queryClient } );

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

	it( 'ignores clicks until the saved keys load', async () => {
		const user = userEvent.setup();
		const keys = deferredReply( { keys: [ SAVED_KEY ], total: 1 } );
		nock( BASE ).get( KEYS_PATH ).reply( keys.reply );
		renderButton();

		const button = screen.getByRole( 'button', { name: 'Save to read later' } );
		expect( button ).toHaveAttribute( 'aria-disabled', 'true' );
		await user.click( button );

		expect( recordTrackForPost ).not.toHaveBeenCalled();
		keys.finish();
		await waitFor( () => expect( button ).toHaveAccessibleName( 'Saved' ) );
		expect( button ).toHaveAttribute( 'aria-disabled', 'false' );
	} );

	it( 'stays disabled when the saved keys fail to load', async () => {
		const user = userEvent.setup();
		nock( BASE ).get( KEYS_PATH ).reply( 500, { code: 'internal_error' } );
		const { queryClient } = renderButton();
		await waitFor( () =>
			expect( queryClient.getQueryState( readSavedKeysQuery().queryKey )?.status ).toBe( 'error' )
		);

		const button = screen.getByRole( 'button', { name: 'Save to read later' } );
		expect( button ).toHaveAttribute( 'aria-disabled', 'true' );
		await user.click( button );

		expect( recordTrackForPost ).not.toHaveBeenCalled();
	} );

	it( 'saves the post and records the save', async () => {
		const user = userEvent.setup();
		mockKeys( [] );
		const save = mockWrite( 'new' );
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
		const unsave = mockWrite( 'delete' );
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
		const save = deferredReply( writeResponse( 'new' ) );
		nock( BASE ).post( '/wpcom/v2/read/saved/new', WRITE_BODY ).reply( save.reply );
		const refetch = mockKeys( [ SAVED_KEY ] );
		await renderLoadedButton();

		await user.click( screen.getByRole( 'button', { name: 'Save to read later' } ) );
		const button = screen.getByRole( 'button', { name: 'Saved' } );
		await waitFor( () => expect( button ).toHaveAttribute( 'aria-disabled', 'true' ) );
		await user.click( button );

		expect( recordTrackForPost ).toHaveBeenCalledTimes( 1 );
		save.finish();
		await waitFor( () => expect( refetch.isDone() ).toBe( true ) );
		await waitFor( () => expect( button ).toHaveAttribute( 'aria-disabled', 'false' ) );
		expect( button ).toHaveAccessibleName( 'Saved' );
	} );

	it( 'shows a notice and restores the button when a save fails', async () => {
		const user = userEvent.setup();
		mockKeys( [], 2 );
		mockWrite( 'new', 500, { code: 'reader_saved_db_error' } );
		const { dispatch } = await renderLoadedButton();

		await user.click( screen.getByRole( 'button', { name: 'Save to read later' } ) );

		await waitFor( () =>
			expectNotice( dispatch, 'Sorry, there was a problem saving that post. Please try again.' )
		);
		expect( screen.getByRole( 'button', { name: 'Save to read later' } ) ).toBeVisible();
	} );

	it( 'explains when the saved posts limit is reached', async () => {
		const user = userEvent.setup();
		mockKeys( [], 2 );
		mockWrite( 'new', 403, { code: 'saved_limit_reached' } );
		const { dispatch } = await renderLoadedButton();

		await user.click( screen.getByRole( 'button', { name: 'Save to read later' } ) );

		await waitFor( () =>
			expectNotice( dispatch, 'You’ve saved as many posts as you can. Remove some to save more.' )
		);
		expect( screen.getByRole( 'button', { name: 'Save to read later' } ) ).toBeVisible();
	} );

	it( 'shows a notice and restores the button when an unsave fails', async () => {
		const user = userEvent.setup();
		mockKeys( [ SAVED_KEY ], 2 );
		mockWrite( 'delete', 500, { code: 'reader_saved_db_error' } );
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
