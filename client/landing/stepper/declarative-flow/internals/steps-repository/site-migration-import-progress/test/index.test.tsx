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
const RUN_ID = 'run-123';
const SESSION_ID = 'session-abc';
const PLAN_HASH = 'sha256-reviewed';
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

jest.mock( 'calypso/landing/stepper/hooks/use-site-data', () => ( {
	useSiteData: () => ( { siteId: 123, siteSlug: 'example.wordpress.com', siteSlugOrId: 123 } ),
} ) );

const mockApi = () => nock( 'https://public-api.wordpress.com:443' );

const sessionPath = `/wpcom/v2/sites/${ SITE_ID }/static-site-import-session/${ SESSION_ID }`;
const approvePath = `${ sessionPath }/approve`;
const attachPath = `/wpcom/v2/switch-runs/${ RUN_ID }/attach`;

const sessionBody = ( state: StaticSiteImportState, planHash?: string ) => ( {
	session_id: SESSION_ID,
	status: state === 'finished' || state === 'failed' ? state : 'running',
	state,
	source_digest: 'sha256-source',
	site_url: 'https://example.wordpress.com/',
	preview_summary: { posts: 8, pages: 12, media: 42, assets: 96, blocks: 214 },
	...( planHash ? { plan_hash: planHash } : {} ),
} );

const mockSessionForever = ( state: StaticSiteImportState, planHash?: string ) =>
	mockApi().persist().get( sessionPath ).query( true ).reply( 200, sessionBody( state, planHash ) );

/** Counts approve requests so tests can assert "exactly once" and "never". */
const mockApprove = ( status = 200 ) => {
	const calls: unknown[] = [];
	mockApi()
		.persist()
		.post( approvePath )
		.query( true )
		.reply( status, ( _uri, body ) => {
			calls.push( body );
			return status === 200 ? sessionBody( 'queued' ) : { error: 'plan_hash_mismatch' };
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
		Object.keys( flowState ).forEach( ( key ) => delete flowState[ key ] );
	} );

	afterEach( () => {
		jest.clearAllMocks();
		nock.cleanAll();
	} );

	afterAll( () => nock.enableNetConnect() );

	it( 'attaches the switch run to the destination site and polls the session it returns', async () => {
		const attach = mockApi()
			.post( attachPath, { destination_blog_id: SITE_ID } )
			.query( true )
			.reply( 200, { run_id: RUN_ID, state: 'attached', session_id: SESSION_ID } );
		mockSessionForever( 'capturing' );

		render( { search: `switchRunId=${ RUN_ID }` } );

		await waitFor( () => expect( attach.isDone() ).toBe( true ) );
		await waitFor( () =>
			expect( screen.getByRole( 'heading', { name: 'Reading your site' } ) ).toBeVisible()
		);
	} );

	it( 'shows a generic failure when the run cannot be attached to this site', async () => {
		mockApi().post( attachPath ).query( true ).reply( 409, { error: 'already_attached' } );

		render( { search: `switchRunId=${ RUN_ID }` } );

		await waitFor( () =>
			expect(
				screen.getByRole( 'heading', { name: 'We couldn’t finish your migration' } )
			).toBeVisible()
		);
		expect( screen.getByText( 'We couldn’t connect this import to your site.' ) ).toBeVisible();
	} );

	it( 'approves exactly once when the reviewed plan hash matches the polled session', async () => {
		mockSessionForever( 'preview_ready', PLAN_HASH );
		const approveCalls = mockApprove();

		render( { search: `sessionId=${ SESSION_ID }&planHash=${ PLAN_HASH }` } );

		await waitFor( () => expect( approveCalls ).toHaveLength( 1 ) );
		expect( approveCalls[ 0 ] ).toEqual( { plan_hash: PLAN_HASH } );

		// Let further polls land; the ref guard must keep this at a single approval.
		await settle( 50 );
		expect( approveCalls ).toHaveLength( 1 );
	} );

	it( 'never approves when the polled plan hash is not the one the user reviewed', async () => {
		mockSessionForever( 'preview_ready', 'sha256-rebuilt' );
		const approveCalls = mockApprove();

		render( { search: `sessionId=${ SESSION_ID }&planHash=${ PLAN_HASH }` } );

		await settle( 50 );
		expect( approveCalls ).toHaveLength( 0 );
	} );

	it( 'never approves on direct navigation without a reviewed plan hash', async () => {
		mockSessionForever( 'preview_ready', PLAN_HASH );
		const approveCalls = mockApprove();

		render( { search: `sessionId=${ SESSION_ID }` } );

		await waitFor( () =>
			expect( screen.getByRole( 'heading', { name: 'Ready to move your site' } ) ).toBeVisible()
		);
		expect( approveCalls ).toHaveLength( 0 );

		await settle( 50 );
		expect( approveCalls ).toHaveLength( 0 );
	} );

	it( 'approves only after the user confirms when no reviewed plan hash was carried in', async () => {
		mockSessionForever( 'preview_ready', PLAN_HASH );
		const approveCalls = mockApprove();

		render( { search: `sessionId=${ SESSION_ID }` } );

		const start = await screen.findByRole( 'button', { name: 'Start the import' } );
		await userEvent.click( start );

		await waitFor( () => expect( approveCalls ).toHaveLength( 1 ) );
		expect( approveCalls[ 0 ] ).toEqual( { plan_hash: PLAN_HASH } );
	} );

	it( 'surfaces a stale preview as an error instead of retrying', async () => {
		mockSessionForever( 'preview_ready', PLAN_HASH );
		const approveCalls = mockApprove( 409 );

		render( { search: `sessionId=${ SESSION_ID }&planHash=${ PLAN_HASH }` } );

		await waitFor( () =>
			expect(
				screen.getByText( 'This preview is out of date, so we stopped before changing anything.' )
			).toBeVisible()
		);

		await settle( 50 );
		expect( approveCalls ).toHaveLength( 1 );
	} );

	it( 'shows the failure copy when the import fails', async () => {
		mockSessionForever( 'failed' );

		render( { search: `sessionId=${ SESSION_ID }&planHash=${ PLAN_HASH }` } );

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
			search: `sessionId=${ SESSION_ID }&planHash=${ PLAN_HASH }`,
			navigation: { submit },
		} );

		await waitFor( () =>
			expect( submit ).toHaveBeenCalledWith( {
				sessionId: SESSION_ID,
				planHash: PLAN_HASH,
				state: 'finished',
			} )
		);
		expect( submit ).toHaveBeenCalledTimes( 1 );
		expect( screen.getByRole( 'heading', { name: 'Your site is ready' } ) ).toBeVisible();
	} );

	it( 'walks through the stage copy while polling and stops at finished', async () => {
		jest.useFakeTimers( { doNotFake: [ 'setImmediate', 'nextTick', 'queueMicrotask' ] } );
		const submit = jest.fn();
		const states: StaticSiteImportState[] = [ 'queued', 'applying', 'finished' ];
		let polls = 0;

		mockApi()
			.persist()
			.get( sessionPath )
			.query( true )
			.reply( 200, () => {
				const state = states[ Math.min( polls, states.length - 1 ) ];
				polls += 1;
				return sessionBody( state );
			} );

		render( {
			search: `sessionId=${ SESSION_ID }&planHash=${ PLAN_HASH }`,
			navigation: { submit },
		} );

		await waitFor( () =>
			expect( screen.getByText( 'Your migration is queued and will start shortly.' ) ).toBeVisible()
		);

		// waitFor drives the fake clock, so the timeout has to cover a poll interval.
		await waitFor(
			() => expect( screen.getByText( 'We’re moving your content across now.' ) ).toBeVisible(),
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
