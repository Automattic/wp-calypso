/**
 * @jest-environment jsdom
 */
import wpcom from 'calypso/lib/wp';
import { wpcomAgentStudioService } from '../agent-studio-service';

jest.mock( 'calypso/lib/wp', () => ( {
	__esModule: true,
	default: {
		req: {
			get: jest.fn(),
			post: jest.fn(),
		},
	},
} ) );

const mockedGet = wpcom.req.get as jest.MockedFunction< typeof wpcom.req.get >;
const mockedPost = wpcom.req.post as jest.MockedFunction< typeof wpcom.req.post >;

const AGENCY_ID = 42;

beforeEach( () => {
	jest.clearAllMocks();
} );

describe( 'wpcomAgentStudioService.listOutputs', () => {
	it( 'fetches outputs for the active agency and unwraps the envelope', async () => {
		const fakeOutputs = [
			{
				id: 'run-1',
				projectId: '',
				title: 'Launch one-pager',
				description: 'Pitch leave-behind.',
				agentName: 'June',
				deliverableType: 'PDF',
				status: 'ready' as const,
				downloadUrl: 'https://example.com/run-1.pdf',
				pageCount: 4,
				createdAt: '2026-05-20T10:00:00Z',
				updatedAt: '2026-05-20T10:05:00Z',
			},
		];
		mockedGet.mockResolvedValueOnce( { outputs: fakeOutputs } );

		const outputs = await wpcomAgentStudioService.listOutputs( AGENCY_ID );

		expect( outputs ).toEqual( fakeOutputs );
		expect( mockedGet ).toHaveBeenCalledWith( {
			apiNamespace: 'wpcom/v2',
			path: '/agency/42/a4a/outputs',
		} );
	} );

	it( 'returns an empty array when the response envelope is missing outputs', async () => {
		mockedGet.mockResolvedValueOnce( {} );

		expect( await wpcomAgentStudioService.listOutputs( AGENCY_ID ) ).toEqual( [] );
	} );
} );

describe( 'wpcomAgentStudioService.createOutput', () => {
	it( 'uploads the first image, dispatches the recipe, and synthesizes the row', async () => {
		mockedPost.mockResolvedValueOnce( { url: 'https://example.com/hero.png' } );
		mockedPost.mockResolvedValueOnce( { run_id: 99, status: 'pending' } );

		const file = new File( [ 'image-bytes' ], 'hero.png', { type: 'image/png' } );

		const output = await wpcomAgentStudioService.createOutput( AGENCY_ID, {
			agentId: 'one-pager',
			agentName: 'June',
			deliverableType: 'PDF',
			title: 'Launch one-pager',
			description: 'Pitch leave-behind.',
			brief: 'Launch copy paragraph.',
			blurb: 'A short blurb.',
			images: [ file ],
		} );

		// Step 1: media upload.
		expect( mockedPost ).toHaveBeenNthCalledWith( 1, {
			apiNamespace: 'wpcom/v2',
			path: '/agency/42/a4a/media',
			body: expect.any( FormData ),
		} );
		const firstCall = mockedPost.mock.calls[ 0 ][ 0 ] as { body: FormData };
		expect( firstCall.body.get( 'media' ) ).toBe( file );

		// Step 2: recipe dispatch — note no project_id in the body.
		expect( mockedPost ).toHaveBeenNthCalledWith( 2, {
			apiNamespace: 'wpcom/v2',
			path: '/agency/42/a4a/runs',
			body: {
				recipe: 'compose-one-pager',
				input: {
					text: 'Launch copy paragraph.',
					blurb: 'A short blurb.',
					hero_url: 'https://example.com/hero.png',
				},
			},
		} );

		// Step 3: synthesized output.
		expect( output.id ).toBe( '99' );
		expect( output.status ).toBe( 'generating' );
		expect( output.title ).toBe( 'Launch one-pager' );
		expect( output.agentName ).toBe( 'June' );
	} );

	it( 'omits the upload call when no images are provided', async () => {
		mockedPost.mockResolvedValueOnce( { run_id: 100 } );

		await wpcomAgentStudioService.createOutput( AGENCY_ID, {
			agentId: 'one-pager',
			agentName: 'June',
			deliverableType: 'PDF',
			title: 'Text-only one-pager',
			description: '',
			brief: 'Just words.',
			blurb: '',
			images: [],
		} );

		expect( mockedPost ).toHaveBeenCalledTimes( 1 );
		expect( mockedPost ).toHaveBeenCalledWith( {
			apiNamespace: 'wpcom/v2',
			path: '/agency/42/a4a/runs',
			body: {
				recipe: 'compose-one-pager',
				input: { text: 'Just words.', blurb: '', hero_url: '' },
			},
		} );
	} );

	it( 'maps an unknown server status to generating', async () => {
		mockedPost.mockResolvedValueOnce( { run_id: 'abc-123' } );

		const output = await wpcomAgentStudioService.createOutput( AGENCY_ID, {
			agentId: 'one-pager',
			agentName: 'June',
			deliverableType: 'PDF',
			title: '',
			description: '',
			brief: '',
			blurb: '',
			images: [],
		} );

		expect( output.status ).toBe( 'generating' );
		expect( output.id ).toBe( 'abc-123' );
	} );
} );

describe( 'wpcomAgentStudioService.deleteOutput', () => {
	it( 'issues a DELETE request against the run', async () => {
		mockedPost.mockResolvedValueOnce( undefined );

		await wpcomAgentStudioService.deleteOutput( AGENCY_ID, 'run-7' );

		expect( mockedPost ).toHaveBeenCalledWith( {
			method: 'DELETE',
			apiNamespace: 'wpcom/v2',
			path: '/agency/42/a4a/runs/run-7',
		} );
	} );
} );

describe( 'wpcomAgentStudioService.suggestOnePagerContent', () => {
	const content =
		'A faster path from first sale to repeat customer\n' +
		'We help agencies cut launch time. Clients see results in weeks. Extra detail here.';

	it( 'suggests a title from the first line of content', async () => {
		expect( await wpcomAgentStudioService.suggestOnePagerContent( content, 'title' ) ).toBe(
			'A faster path from first sale to repeat customer'
		);
	} );

	it( 'suggests a blurb from the sentences after the first line', async () => {
		expect( await wpcomAgentStudioService.suggestOnePagerContent( content, 'blurb' ) ).toBe(
			'We help agencies cut launch time. Clients see results in weeks.'
		);
	} );

	it( 'returns an empty string for empty content', async () => {
		expect( await wpcomAgentStudioService.suggestOnePagerContent( '   ', 'title' ) ).toBe( '' );
		expect( await wpcomAgentStudioService.suggestOnePagerContent( '   ', 'blurb' ) ).toBe( '' );
	} );

	it( 'does not call the network', async () => {
		await wpcomAgentStudioService.suggestOnePagerContent( content, 'title' );
		expect( mockedGet ).not.toHaveBeenCalled();
		expect( mockedPost ).not.toHaveBeenCalled();
	} );
} );
