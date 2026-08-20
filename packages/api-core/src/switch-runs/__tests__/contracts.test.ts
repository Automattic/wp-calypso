import nock from 'nock';
import { fetchSwitchRun } from '../fetchers';
import { attachSwitchRun, createSwitchRun } from '../mutators';

const BASE = 'https://public-api.wordpress.com';

describe( 'Switch run contracts', () => {
	afterEach( () => nock.cleanAll() );

	it( 'creates an analysis run with only the normalized source URL', async () => {
		const scope = nock( BASE )
			.post( '/wpcom/v2/switch-runs', { source_url: 'https://example.com/' } )
			.reply( 200, { run_id: 'run-123', state: 'analysis_queued' } );

		await expect(
			createSwitchRun( { source_url: 'https://example.com/' } )
		).resolves.toMatchObject( {
			run_id: 'run-123',
			state: 'analysis_queued',
		} );
		expect( scope.isDone() ).toBe( true );
	} );

	it( 'fetches a run and attaches its captured artifact to a destination', async () => {
		const run = {
			run_id: 'run-123',
			state: 'analysis_ready',
			metrics: { files: 4, bytes: 1024 },
			recommendation: {
				strategy: 'ssi',
				confidence: 'high',
				reasons: [ 'captured_static_archive' ],
			},
		};
		const fetchScope = nock( BASE ).get( '/wpcom/v2/switch-runs/run-123' ).reply( 200, run );
		const attachScope = nock( BASE )
			.post( '/wpcom/v2/switch-runs/run-123/attach', { destination_blog_id: 42 } )
			.reply( 200, { ...run, state: 'attached', session_id: 'session-123' } );

		await expect( fetchSwitchRun( 'run-123' ) ).resolves.toEqual( run );
		await expect(
			attachSwitchRun( 'run-123', { destination_blog_id: 42 } )
		).resolves.toMatchObject( {
			session_id: 'session-123',
			state: 'attached',
		} );
		expect( fetchScope.isDone() ).toBe( true );
		expect( attachScope.isDone() ).toBe( true );
	} );
} );
