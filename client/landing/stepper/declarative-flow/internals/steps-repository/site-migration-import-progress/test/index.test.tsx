/**
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import React from 'react';
import SiteMigrationImportProgress from '..';
import { StepProps } from '../../../types';
import { mockStepProps, renderStep } from '../../test/helpers';
import type { StaticSiteImportState } from '@automattic/api-core';

const SITE_ID = 123;
const SESSION_ID = 'sessionabc123';
const SOURCE_URL = 'https://terraandtwine.com';
const ARCHIVE_HASH = 'a'.repeat( 64 );
const SOURCE_DIGEST = 'c'.repeat( 64 );
const POLL_INTERVAL = 5000;

const flowState: Record< string, unknown > = {};

jest.mock( '../../../state-manager/store', () => ( {
	useFlowState: () => ( {
		get: ( key: string ) => flowState[ key ],
		set: ( key: string, value: unknown ) => {
			flowState[ key ] = value;
		},
		sessionId: null,
	} ),
} ) );

// jest.mock factories may only close over `mock`-prefixed names.
let mockSiteId: number | undefined = SITE_ID;

jest.mock( 'calypso/landing/stepper/hooks/use-site-data', () => ( {
	useSiteData: () => ( {
		siteId: mockSiteId,
		siteSlug: 'example.wordpress.com',
		siteSlugOrId: mockSiteId,
	} ),
} ) );

const mockApi = () => nock( 'https://public-api.wordpress.com:443' );

// The session is the user's: no site appears in the path of either the creation
// or the polling route. The destination is named in the approve body alone.
const CREATE_PATH = '/wpcom/v2/static-site-import-session';
const SESSION_PATH = `${ CREATE_PATH }/${ SESSION_ID }`;
const APPROVE_PATH = `${ SESSION_PATH }/approve`;

/** A response carrying exactly the fields the API contract defines. */
const sessionBody = (
	state: StaticSiteImportState,
	extra: {
		archive_hash?: string;
		receipt?: { success: boolean; code?: string };
	} = {}
) => ( {
	session_id: SESSION_ID,
	status: state === 'finished' || state === 'failed' ? state : 'new',
	state,
	source_digest: SOURCE_DIGEST,
	preview_summary: { pages: 12, blocks: 214, diagnostics: { total: 3, warning: 3 } },
	site_url: 'https://example.wordpress.com/',
	...extra,
} );

/** The shape a WP_Error reaches the client in. */
const errorBody = ( code: string, status = 409 ) => ( {
	code,
	message: 'Refused.',
	data: { status },
} );

const mockCreate = ( sourceUrl = SOURCE_URL ) =>
	mockApi()
		.post( CREATE_PATH, { source_url: sourceUrl } )
		.query( true )
		.reply( 200, sessionBody( 'capture_queued' ) );

const mockCreateFailure = ( code: string, status = 409 ) =>
	mockApi().post( CREATE_PATH ).query( true ).reply( status, errorBody( code, status ) );

const mockSessionForever = ( state: StaticSiteImportState, archiveHash?: string ) =>
	mockApi()
		.persist()
		.get( SESSION_PATH )
		.query( true )
		.reply( 200, sessionBody( state, archiveHash ? { archive_hash: archiveHash } : {} ) );

/** Records approve request bodies so tests can assert on them, and count them. */
const mockApprove = ( status = 200, code = '' ) => {
	const calls: unknown[] = [];
	mockApi()
		.persist()
		.post( APPROVE_PATH )
		.query( true )
		.reply( status, ( _uri, body ) => {
			calls.push( body );
			return status === 200 ? sessionBody( 'queued' ) : errorBody( code, status );
		} );
	return calls;
};

/** Lets in-flight polls and their re-renders land before asserting on them. */
const settle = async ( ms: number ) =>
	act( async () => {
		await new Promise( ( resolve ) => setTimeout( resolve, ms ) );
	} );

const render = ( { search, ...props }: Partial< StepProps > & { search?: string } = {} ) => {
	const queryClient = new QueryClient( {
		defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
	} );

	const combinedProps = mockStepProps( {
		stepName: 'site-migration-import-progress',
		flow: 'site-migration',
		...props,
	} );

	return renderStep(
		<QueryClientProvider client={ queryClient }>
			<SiteMigrationImportProgress { ...combinedProps } />
		</QueryClientProvider>,
		{ initialEntry: `/site-migration-import-progress?siteId=${ SITE_ID }&${ search ?? '' }` }
	);
};

describe( 'SiteMigrationImportProgress', () => {
	beforeAll( () => nock.disableNetConnect() );

	beforeEach( () => {
		mockSiteId = SITE_ID;
		Object.keys( flowState ).forEach( ( key ) => delete flowState[ key ] );
	} );

	afterEach( () => {
		jest.clearAllMocks();
		nock.cleanAll();
	} );

	afterAll( () => nock.enableNetConnect() );

	describe( 'starting the session', () => {
		it( 'creates a session from the source URL and polls the session it returns', async () => {
			const create = mockCreate();
			mockSessionForever( 'capturing' );

			render( { search: `from=${ encodeURIComponent( SOURCE_URL ) }` } );

			await waitFor( () => expect( create.isDone() ).toBe( true ) );
			await waitFor( () =>
				expect( screen.getByRole( 'heading', { name: 'Reading your site' } ) ).toBeVisible()
			);
		} );

		it( 'takes the source URL from the identify step when the URL does not carry one', async () => {
			flowState[ 'site-migration-identify' ] = { from: SOURCE_URL };
			const create = mockCreate();
			mockSessionForever( 'capturing' );

			render();

			await waitFor( () => expect( create.isDone() ).toBe( true ) );
		} );

		it( 'polls an existing session without creating another one', async () => {
			mockSessionForever( 'capturing' );

			render( {
				search: `sessionId=${ SESSION_ID }&from=${ encodeURIComponent( SOURCE_URL ) }`,
			} );

			await waitFor( () =>
				expect( screen.getByRole( 'heading', { name: 'Reading your site' } ) ).toBeVisible()
			);
			// A create interceptor was never registered, so any attempt would throw.
			await settle( 50 );
		} );

		it( 'polls before a destination site exists', async () => {
			mockSiteId = undefined;
			mockSessionForever( 'capturing' );

			render( { search: `sessionId=${ SESSION_ID }` } );

			await waitFor( () =>
				expect( screen.getByRole( 'heading', { name: 'Reading your site' } ) ).toBeVisible()
			);
		} );

		it( 'reports a source URL the API will not read', async () => {
			mockCreateFailure( 'invalid_static_site_source_url', 422 );

			render( { search: `from=${ encodeURIComponent( SOURCE_URL ) }` } );

			await waitFor( () =>
				expect(
					screen.getByText(
						'We couldn’t read that address. Check the site is public and try again.'
					)
				).toBeVisible()
			);
		} );

		it( 'reports an import that is already running rather than a generic failure', async () => {
			mockCreateFailure( 'import_exists' );

			render( { search: `from=${ encodeURIComponent( SOURCE_URL ) }` } );

			await waitFor( () =>
				expect(
					screen.getByText(
						'You already have an import running. Wait for it to finish, then try again.'
					)
				).toBeVisible()
			);
		} );

		it( 'says nothing can be continued when it has neither a session nor a source URL', async () => {
			render();

			await waitFor( () =>
				expect( screen.getByText( 'We couldn’t find a migration to continue.' ) ).toBeVisible()
			);
		} );
	} );

	describe( 'approving', () => {
		it( 'sends the archive hash and the destination site, exactly once', async () => {
			mockSessionForever( 'preview_ready', ARCHIVE_HASH );
			const approveCalls = mockApprove();

			render( { search: `sessionId=${ SESSION_ID }&archiveHash=${ ARCHIVE_HASH }` } );

			await waitFor( () => expect( approveCalls ).toHaveLength( 1 ) );
			expect( approveCalls[ 0 ] ).toEqual( {
				archive_hash: ARCHIVE_HASH,
				destination_blog_id: SITE_ID,
			} );

			// Let further polls land; the ref guard must keep this at a single approval.
			await settle( 50 );
			expect( approveCalls ).toHaveLength( 1 );
		} );

		it( 'never approves when the polled archive hash is not the one the user reviewed', async () => {
			mockSessionForever( 'preview_ready', 'b'.repeat( 64 ) );
			const approveCalls = mockApprove();

			render( { search: `sessionId=${ SESSION_ID }&archiveHash=${ ARCHIVE_HASH }` } );

			await settle( 50 );
			expect( approveCalls ).toHaveLength( 0 );
		} );

		it( 'never approves on direct navigation without a reviewed archive hash', async () => {
			mockSessionForever( 'preview_ready', ARCHIVE_HASH );
			const approveCalls = mockApprove();

			render( { search: `sessionId=${ SESSION_ID }` } );

			await waitFor( () =>
				expect( screen.getByRole( 'heading', { name: 'Ready to move your site' } ) ).toBeVisible()
			);
			expect( approveCalls ).toHaveLength( 0 );

			await settle( 50 );
			expect( approveCalls ).toHaveLength( 0 );
		} );

		it( 'approves only after the user confirms when no reviewed hash was carried in', async () => {
			mockSessionForever( 'preview_ready', ARCHIVE_HASH );
			const approveCalls = mockApprove();

			render( { search: `sessionId=${ SESSION_ID }` } );

			await userEvent.click( await screen.findByRole( 'button', { name: 'Start the import' } ) );

			await waitFor( () => expect( approveCalls ).toHaveLength( 1 ) );
			expect( approveCalls[ 0 ] ).toEqual( {
				archive_hash: ARCHIVE_HASH,
				destination_blog_id: SITE_ID,
			} );
		} );

		it( 'cannot be confirmed while no destination site is known', async () => {
			mockSiteId = undefined;
			mockSessionForever( 'preview_ready', ARCHIVE_HASH );

			render( { search: `sessionId=${ SESSION_ID }` } );

			expect( await screen.findByRole( 'button', { name: 'Start the import' } ) ).toBeDisabled();
		} );
	} );

	describe( 'telling the 409s apart', () => {
		const approveAndRead = async ( code: string ) => {
			mockSessionForever( 'preview_ready', ARCHIVE_HASH );
			const approveCalls = mockApprove( 409, code );

			render( { search: `sessionId=${ SESSION_ID }&archiveHash=${ ARCHIVE_HASH }` } );

			await waitFor( () => expect( approveCalls ).toHaveLength( 1 ) );
			return approveCalls;
		};

		it( 'reads a changed archive as a stale preview', async () => {
			const calls = await approveAndRead( 'static_site_import_archive_mismatch' );

			await waitFor( () =>
				expect(
					screen.getByText( 'This preview is out of date, so we stopped before changing anything.' )
				).toBeVisible()
			);
			// The failure is terminal: it must not retry.
			await settle( 50 );
			expect( calls ).toHaveLength( 1 );
		} );

		it( 'reads a destination that cannot host the import as a plan problem', async () => {
			await approveAndRead( 'static_site_import_atomic_unavailable' );

			await waitFor( () =>
				expect(
					screen.getByText(
						'Your plan can’t host an imported site. Upgrade the plan and try again.'
					)
				).toBeVisible()
			);
		} );

		it( 'reads a session that is not ready as a retryable state', async () => {
			await approveAndRead( 'static_site_import_not_approvable' );

			await waitFor( () =>
				expect(
					screen.getByText( 'This import isn’t ready to start yet. Refresh the page to try again.' )
				).toBeVisible()
			);
		} );

		it( 'falls back to the generic message for a code it does not know', async () => {
			await approveAndRead( 'static_site_import_queue_failed' );

			await waitFor( () =>
				expect(
					screen.getByText( 'Something went wrong and your site wasn’t changed.' )
				).toBeVisible()
			);
		} );
	} );

	describe( 'reporting progress', () => {
		it( 'shows the failure copy when the session fails', async () => {
			mockSessionForever( 'failed' );

			render( { search: `sessionId=${ SESSION_ID }&archiveHash=${ ARCHIVE_HASH }` } );

			await waitFor( () =>
				expect(
					screen.getByRole( 'heading', { name: 'We couldn’t finish your migration' } )
				).toBeVisible()
			);
			expect(
				screen.getByText( 'Something went wrong and your site wasn’t changed.' )
			).toBeVisible();
		} );

		it( 'submits once the session finishes', async () => {
			mockSessionForever( 'finished' );
			const submit = jest.fn();

			render( {
				search: `sessionId=${ SESSION_ID }&archiveHash=${ ARCHIVE_HASH }`,
				navigation: { submit },
			} );

			await waitFor( () =>
				expect( submit ).toHaveBeenCalledWith( {
					sessionId: SESSION_ID,
					archiveHash: ARCHIVE_HASH,
					state: 'finished',
				} )
			);
			expect( submit ).toHaveBeenCalledTimes( 1 );
			expect( screen.getByRole( 'heading', { name: 'Your site is ready' } ) ).toBeVisible();
		} );

		it( 'walks through the stage copy while polling and stops at finished', async () => {
			jest.useFakeTimers( { doNotFake: [ 'setImmediate', 'nextTick', 'queueMicrotask' ] } );
			const submit = jest.fn();
			const states: StaticSiteImportState[] = [ 'capturing', 'building', 'queued', 'finished' ];
			let polls = 0;

			mockApi()
				.persist()
				.get( SESSION_PATH )
				.query( true )
				.reply( 200, () => {
					const state = states[ Math.min( polls, states.length - 1 ) ];
					polls += 1;
					return sessionBody( state );
				} );

			render( {
				search: `sessionId=${ SESSION_ID }&archiveHash=${ ARCHIVE_HASH }`,
				navigation: { submit },
			} );

			await waitFor( () =>
				expect(
					screen.getByText( 'We’re collecting your pages, posts, and images.' )
				).toBeVisible()
			);

			// waitFor drives the fake clock, so the timeout has to cover a poll interval.
			await waitFor(
				() =>
					expect(
						screen.getByText( 'We’re turning your pages into WordPress content.' )
					).toBeVisible(),
				{ timeout: 4 * POLL_INTERVAL }
			);

			await waitFor(
				() =>
					expect(
						screen.getByText( 'Your migration is queued and will start shortly.' )
					).toBeVisible(),
				{ timeout: 4 * POLL_INTERVAL }
			);

			await waitFor(
				() => expect( screen.getByRole( 'heading', { name: 'Your site is ready' } ) ).toBeVisible(),
				{ timeout: 4 * POLL_INTERVAL }
			);
			expect( submit ).toHaveBeenCalledTimes( 1 );

			// Polling stops for good at a terminal state.
			const pollsAtFinish = polls;
			await act( async () => {
				jest.advanceTimersByTime( 4 * POLL_INTERVAL );
			} );
			expect( polls ).toBe( pollsAtFinish );

			jest.useRealTimers();
		} );
	} );
} );
