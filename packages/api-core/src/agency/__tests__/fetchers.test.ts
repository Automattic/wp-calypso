import nock from 'nock';
import { fetchAmplifyReports, fetchAmplifyJobs, submitAmplifyAnalysis } from '../fetchers';

const BASE = 'https://public-api.wordpress.com';
const AGENCY_ID = 233039785;

describe( 'amplify fetchers', () => {
	afterEach( () => nock.cleanAll() );

	it( 'fetchAmplifyReports unwraps the reports envelope', async () => {
		const report = {
			id: 'report_1',
			status: 'completed',
			url: 'https://example.com',
			agency_name: 'Acme',
			mode: 'fullanalysis',
			timestamp: '2026-06-17T12:34:56.789Z',
			user_id: 42,
			score: { human: 80, ai: 90 },
			pdf_url: 'https://example.com/report.pdf',
		};
		nock( BASE )
			.get( `/wpcom/v2/agency/${ AGENCY_ID }/amplify/reports` )
			.reply( 200, { reports: [ report ] } );

		await expect( fetchAmplifyReports( AGENCY_ID ) ).resolves.toEqual( [ report ] );
	} );

	it( 'fetchAmplifyJobs unwraps the jobs envelope', async () => {
		const job = {
			id: 'run_abc123',
			status: 'pending',
			url: 'https://example.com',
			mode: 'ai',
			timestamp: '2026-06-17T12:34:56.789Z',
		};
		nock( BASE )
			.get( `/wpcom/v2/agency/${ AGENCY_ID }/amplify/jobs` )
			.reply( 200, { jobs: [ job ] } );

		await expect( fetchAmplifyJobs( AGENCY_ID ) ).resolves.toEqual( [ job ] );
	} );

	it( 'submitAmplifyAnalysis posts url + mode and returns the run', async () => {
		const run = {
			id: 'run_abc123',
			status: 'pending',
			url: 'https://example.com',
			mode: 'fullanalysis',
			timestamp: '2026-06-17T12:34:56.789Z',
		};
		nock( BASE )
			.post( `/wpcom/v2/agency/${ AGENCY_ID }/amplify/reports`, {
				url: 'https://example.com',
				mode: 'fullanalysis',
			} )
			.reply( 202, run );

		await expect(
			submitAmplifyAnalysis( AGENCY_ID, { url: 'https://example.com', mode: 'fullanalysis' } )
		).resolves.toEqual( run );
	} );
} );
