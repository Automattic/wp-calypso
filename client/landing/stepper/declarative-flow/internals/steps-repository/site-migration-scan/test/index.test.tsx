/**
 * @jest-environment jsdom
 */
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { useFlowState } from 'calypso/landing/stepper/declarative-flow/internals/state-manager/store';
import SiteMigrationScan from '..';
import { StepProps } from '../../../types';
import { mockStepProps, renderStep } from '../../test/helpers';
import type { SwitchRun, SwitchRunAnalysis } from '@automattic/api-core';

jest.mock( 'calypso/landing/stepper/declarative-flow/internals/state-manager/store', () => ( {
	useFlowState: jest.fn(),
} ) );

const get = jest.fn();
const set = jest.fn();

const mockApi = () => nock( 'https://public-api.wordpress.com:443' );

const FROM = 'https://terraandtwine.com';
const RUN_ID = 'run-123';

const ANALYSIS: SwitchRunAnalysis = {
	site: {
		title: 'Terra & Twine — Handmade Ceramics',
		host: 'terraandtwine.com',
		favicon: 'https://terraandtwine.com/favicon.ico',
	},
	findings: [
		{ key: 'pages', label: '12 pages', detail: 'found', ok: true },
		{ key: 'posts', label: '8 blog posts', detail: 'with authors and dates', ok: true },
	],
	verdict: { level: 'complete', text: 'We found everything.' },
	counts: { pages: 12, posts: 8, images: 42 },
};

const run = ( state: SwitchRun[ 'state' ], extra: Partial< SwitchRun > = {} ): SwitchRun => ( {
	run_id: RUN_ID,
	state,
	created_at: '2026-01-01T00:00:00Z',
	updated_at: '2026-01-01T00:00:00Z',
	expires_at: '2026-01-06T00:00:00Z',
	...extra,
} );

const render = ( props?: Partial< StepProps >, initialEntry?: string ) =>
	renderStep( <SiteMigrationScan { ...mockStepProps( props ) } />, {
		initialEntry: initialEntry ?? `/site-migration-scan?from=${ encodeURIComponent( FROM ) }`,
	} );

describe( 'SiteMigrationScan', () => {
	beforeAll( () => nock.disableNetConnect() );

	beforeEach( () => {
		jest.clearAllMocks();
		nock.cleanAll();
		get.mockReturnValue( undefined );
		jest.mocked( useFlowState ).mockReturnValue( {
			get,
			set,
			sessionId: 'session',
		} as unknown as ReturnType< typeof useFlowState > );
	} );

	it( 'creates a run for the source URL and advances the UI as the analysis progresses', async () => {
		jest.useFakeTimers();

		let postedBody: Record< string, unknown > = {};
		mockApi()
			.post( '/wpcom/v2/switch-runs', ( body ) => {
				postedBody = body;
				return true;
			} )
			.query( true )
			.reply( 200, run( 'analysis_queued' ) );

		mockApi()
			.get( `/wpcom/v2/switch-runs/${ RUN_ID }` )
			.query( true )
			.reply( 200, run( 'analyzing' ) );

		mockApi()
			.get( `/wpcom/v2/switch-runs/${ RUN_ID }` )
			.query( true )
			.reply( 200, run( 'analysis_ready', { analysis: ANALYSIS } ) );

		render();

		await waitFor(
			() => expect( screen.getByText( 'Reading your pages, posts, and images…' ) ).toBeVisible(),
			{ timeout: 15000 }
		);
		expect( postedBody ).toEqual( { source_url: FROM } );

		await waitFor( () => expect( screen.getByText( 'We found everything.' ) ).toBeVisible(), {
			timeout: 15000,
		} );

		expect( screen.getByText( 'Terra & Twine — Handmade Ceramics' ) ).toBeVisible();
		expect( screen.getByText( 'terraandtwine.com' ) ).toBeVisible();

		jest.useRealTimers();
	} );

	it( 'renders the findings the API reports, including the ones it could not capture', async () => {
		mockApi().post( '/wpcom/v2/switch-runs' ).query( true ).reply( 200, run( 'analysis_queued' ) );

		mockApi()
			.get( `/wpcom/v2/switch-runs/${ RUN_ID }` )
			.query( true )
			.reply(
				200,
				run( 'analysis_ready', {
					analysis: {
						...ANALYSIS,
						findings: [
							{ key: 'pages', label: '12 pages', detail: 'found', ok: true },
							{ key: 'forms', label: 'Contact form', detail: 'needs rebuilding', ok: false },
							{ key: 'fonts', label: 'Two fonts', detail: 'will be substituted', ok: false },
						],
						verdict: { level: 'partial', text: 'We found most of it.' },
					},
				} )
			);

		render();

		await waitFor( () => expect( screen.getByText( 'We found most of it.' ) ).toBeVisible() );

		expect( screen.getByText( '12 pages' ) ).toBeVisible();
		expect( screen.getByText( 'Contact form' ) ).toBeVisible();
		expect( screen.getByText( 'needs rebuilding' ) ).toBeVisible();
		expect( screen.getAllByRole( 'img', { name: 'Not captured' } ) ).toHaveLength( 2 );
		expect( screen.getAllByRole( 'img', { name: 'Found' } ) ).toHaveLength( 1 );
	} );

	it( 'submits the failed action so the flow can fall back to the content importer', async () => {
		const submit = jest.fn();

		mockApi().post( '/wpcom/v2/switch-runs' ).query( true ).reply( 200, run( 'analysis_queued' ) );

		mockApi()
			.get( `/wpcom/v2/switch-runs/${ RUN_ID }` )
			.query( true )
			.reply( 200, run( 'failed', { error: 'capture_failed' } ) );

		render( { navigation: { submit } } );

		await waitFor( () =>
			expect( submit ).toHaveBeenCalledWith( { action: 'failed', runId: RUN_ID } )
		);
	} );

	it( 'resumes the run named in the URL rather than creating another one', async () => {
		const createRun = mockApi()
			.post( '/wpcom/v2/switch-runs' )
			.query( true )
			.reply( 200, run( 'analysis_queued' ) );

		mockApi()
			.get( '/wpcom/v2/switch-runs/resumed-run' )
			.query( true )
			.reply( 200, run( 'analysis_ready', { analysis: ANALYSIS } ) );

		render(
			{},
			`/site-migration-scan?from=${ encodeURIComponent( FROM ) }&switchRunId=resumed-run`
		);

		await waitFor( () => expect( screen.getByText( 'We found everything.' ) ).toBeVisible() );

		expect( createRun.isDone() ).toBe( false );
	} );

	it( 'resumes the run held in flow state when the URL has lost it', async () => {
		get.mockImplementation( ( key: string ) =>
			key === 'site-migration-scan' ? { action: 'continue', runId: 'stored-run' } : undefined
		);

		const createRun = mockApi()
			.post( '/wpcom/v2/switch-runs' )
			.query( true )
			.reply( 200, run( 'analysis_queued' ) );

		mockApi()
			.get( '/wpcom/v2/switch-runs/stored-run' )
			.query( true )
			.reply( 200, run( 'analysis_ready', { analysis: ANALYSIS } ) );

		render();

		await waitFor( () => expect( screen.getByText( 'We found everything.' ) ).toBeVisible() );

		expect( createRun.isDone() ).toBe( false );
	} );

	it( 'persists the run and its analysis in flow state, and submits them on continue', async () => {
		const submit = jest.fn();

		mockApi().post( '/wpcom/v2/switch-runs' ).query( true ).reply( 200, run( 'analysis_queued' ) );

		mockApi()
			.get( `/wpcom/v2/switch-runs/${ RUN_ID }` )
			.query( true )
			.reply( 200, run( 'analysis_ready', { analysis: ANALYSIS } ) );

		render( { navigation: { submit } } );

		await waitFor( () => expect( screen.getByText( 'We found everything.' ) ).toBeVisible() );

		expect( set ).toHaveBeenCalledWith( 'site-migration-scan', {
			action: 'continue',
			runId: RUN_ID,
			analysis: ANALYSIS,
		} );

		await userEvent.click( screen.getByRole( 'button', { name: 'Looks right — continue' } ) );

		expect( submit ).toHaveBeenCalledWith( {
			action: 'continue',
			runId: RUN_ID,
			analysis: ANALYSIS,
		} );
	} );
} );
