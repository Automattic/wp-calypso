/**
 * @jest-environment jsdom
 */
const mockWpcomRequest = jest.fn();
const mockCanAccessWpcomApis = jest.fn();
jest.mock( 'wpcom-proxy-request', () => ( {
	__esModule: true,
	default: ( ...args: unknown[] ) => mockWpcomRequest( ...args ),
	canAccessWpcomApis: () => mockCanAccessWpcomApis(),
} ) );

const mockApiFetch = jest.fn();
jest.mock( '@wordpress/api-fetch', () => ( {
	__esModule: true,
	default: ( ...args: unknown[] ) => mockApiFetch( ...args ),
} ) );

const mockGetSessionSiteKey = jest.fn();
jest.mock( '../../../utils/agent-session', () => ( {
	NO_SITE: 'no-site',
	getSessionSiteKey: () => mockGetSessionSiteKey(),
} ) );

import { getSiteSetupTasksCallback } from '../callback';

const RESPONSE = {
	tasks: [
		{ id: 'design', title: 'Customize the design', completed: true, calypso_path: '/themes/x' },
		{ id: 'about', title: 'Publish the About page', completed: true, skipped: true },
		{
			id: 'images',
			title: 'Replace placeholder images',
			in_progress: true,
			subtitle: 'Draft saved',
		},
		{ id: 'domain', title: 'Add a custom domain', disabled: true },
		{ id: 'launch', title: 'Launch site' },
	],
	dismissed: false,
	is_eligible: true,
};

type WindowWithInlineData = Window & { agentsManagerData?: { site?: { ID?: number } } };

beforeEach( () => {
	jest.clearAllMocks();
	mockCanAccessWpcomApis.mockReturnValue( true );
	mockGetSessionSiteKey.mockReturnValue( '123' );
	delete ( window as WindowWithInlineData ).agentsManagerData;
} );

describe( 'getSiteSetupTasksCallback', () => {
	it( 'reads the public API for the session site in Calypso', async () => {
		mockWpcomRequest.mockResolvedValue( RESPONSE );

		const result = await getSiteSetupTasksCallback();

		expect( mockWpcomRequest ).toHaveBeenCalledWith( {
			path: '/sites/123/ai-launchpad',
			apiNamespace: 'wpcom/v2',
		} );
		expect( mockApiFetch ).not.toHaveBeenCalled();
		expect( result ).toMatchObject( {
			result: {
				success: true,
				message: '2 of 5 setup tasks done.',
				details: {
					eligible: true,
					progress: { completed: 2, total: 5 },
					tasks: [
						{
							id: 'design',
							title: 'Customize the design',
							status: 'done',
							url: 'https://wordpress.com/themes/x',
						},
						{ id: 'about', status: 'skipped' },
						{ id: 'images', status: 'in-progress', subtitle: 'Draft saved' },
						{ id: 'domain', status: 'todo', disabled: true },
						{ id: 'launch', status: 'todo', disabled: false },
					],
				},
			},
			returnToAgent: true,
		} );
	} );

	it( 'prefers the wp-admin inline site over the session scope', async () => {
		( window as WindowWithInlineData ).agentsManagerData = { site: { ID: 456 } };
		mockGetSessionSiteKey.mockReturnValue( 'no-site' );
		mockWpcomRequest.mockResolvedValue( RESPONSE );

		await getSiteSetupTasksCallback();

		expect( mockWpcomRequest ).toHaveBeenCalledWith(
			expect.objectContaining( { path: '/sites/456/ai-launchpad' } )
		);
	} );

	it( 'reads the site’s own REST route off wordpress.com', async () => {
		mockCanAccessWpcomApis.mockReturnValue( false );
		mockApiFetch.mockResolvedValue( RESPONSE );

		const result = await getSiteSetupTasksCallback();

		expect( mockApiFetch ).toHaveBeenCalledWith( { path: '/wpcom/v2/ai-launchpad' } );
		expect( mockWpcomRequest ).not.toHaveBeenCalled();
		expect( result.result.success ).toBe( true );
	} );

	it( 'answers with an empty, ineligible list for a site without one', async () => {
		mockWpcomRequest.mockRejectedValue( { error: 'ai_launchpad_not_eligible', statusCode: 404 } );

		const result = await getSiteSetupTasksCallback();

		expect( result ).toMatchObject( {
			result: {
				success: true,
				details: { eligible: false, tasks: [], progress: { completed: 0, total: 0 } },
			},
			returnToAgent: true,
		} );
	} );

	it( 'recognizes the not-eligible code from api-fetch too', async () => {
		mockCanAccessWpcomApis.mockReturnValue( false );
		mockApiFetch.mockRejectedValue( { code: 'ai_launchpad_not_eligible', data: { status: 404 } } );

		const result = await getSiteSetupTasksCallback();

		expect( result.result ).toMatchObject( { success: true, details: { eligible: false } } );
	} );

	it( 'treats a dismissed list as ineligible', async () => {
		mockWpcomRequest.mockResolvedValue( { ...RESPONSE, dismissed: true } );

		const result = await getSiteSetupTasksCallback();

		expect( result.result ).toMatchObject( { success: true, details: { eligible: false } } );
	} );

	it( 'fails when the Calypso chat has no selected site', async () => {
		mockGetSessionSiteKey.mockReturnValue( 'no-site' );

		const result = await getSiteSetupTasksCallback();

		expect( mockWpcomRequest ).not.toHaveBeenCalled();
		expect( result ).toMatchObject( {
			result: { success: false, error: expect.stringContaining( 'No site is selected' ) },
			returnToAgent: true,
		} );
	} );

	it( 'reports a failed request as an error', async () => {
		mockWpcomRequest.mockRejectedValue( new Error( 'boom' ) );

		const result = await getSiteSetupTasksCallback();

		expect( result ).toMatchObject( { result: { success: false, error: 'boom' } } );
	} );

	it( 'resolves task destinations into absolute URLs', async () => {
		mockWpcomRequest.mockResolvedValue( {
			tasks: [
				{ id: 'theme', calypso_path: '/themes/x' },
				{ id: 'editor', calypso_path: 'https://x.wpcomstaging.com/wp-admin/site-editor.php' },
				{ id: 'pay', calypso_path: 'https://connect.stripe.com/oauth' },
				{ id: 'odd', calypso_path: 'javascript:alert(1)' },
				{ id: 'none', calypso_path: null },
			],
			is_eligible: true,
		} );

		const result = await getSiteSetupTasksCallback();

		expect( result.result.details ).toMatchObject( {
			tasks: [
				{ id: 'theme', url: 'https://wordpress.com/themes/x' },
				{ id: 'editor', url: 'https://x.wpcomstaging.com/wp-admin/site-editor.php' },
				{ id: 'pay', url: 'https://connect.stripe.com/oauth' },
				{ id: 'odd' },
				{ id: 'none' },
			],
		} );
		const [ , , , odd, none ] = ( result.result.details as { tasks: { url?: string }[] } ).tasks;
		expect( odd.url ).toBeUndefined();
		expect( none.url ).toBeUndefined();
	} );

	it( 'skips malformed tasks and uses the id when a title is missing', async () => {
		mockWpcomRequest.mockResolvedValue( {
			tasks: [ { id: 'launch' }, { title: 'No id' }, null ],
			is_eligible: true,
		} );

		const result = await getSiteSetupTasksCallback();

		expect( result.result.details ).toMatchObject( {
			tasks: [ { id: 'launch', title: 'launch', status: 'todo' } ],
			progress: { completed: 0, total: 1 },
		} );
		expect( result.result.message ).toBe( '0 of 1 setup task done.' );
	} );
} );
