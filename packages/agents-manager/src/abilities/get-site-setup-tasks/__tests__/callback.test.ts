/**
 * @jest-environment jsdom
 */
const mockApiFetch = jest.fn();
jest.mock( '@wordpress/api-fetch', () => ( {
	__esModule: true,
	default: ( ...args: unknown[] ) => mockApiFetch( ...args ),
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

beforeEach( () => {
	jest.clearAllMocks();
} );

describe( 'getSiteSetupTasksCallback', () => {
	it( 'reads the site’s own REST route and maps the tasks', async () => {
		mockApiFetch.mockResolvedValue( RESPONSE );

		const result = await getSiteSetupTasksCallback();

		expect( mockApiFetch ).toHaveBeenCalledWith( { path: '/wpcom/v2/ai-launchpad' } );
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

	it( 'answers with an empty, ineligible list for a site without one', async () => {
		mockApiFetch.mockRejectedValue( { code: 'ai_launchpad_not_eligible', data: { status: 404 } } );

		const result = await getSiteSetupTasksCallback();

		expect( result ).toMatchObject( {
			result: {
				success: true,
				details: { eligible: false, tasks: [], progress: { completed: 0, total: 0 } },
			},
			returnToAgent: true,
		} );
	} );

	it( 'treats a dismissed list as ineligible', async () => {
		mockApiFetch.mockResolvedValue( { ...RESPONSE, dismissed: true } );

		const result = await getSiteSetupTasksCallback();

		expect( result.result ).toMatchObject( { success: true, details: { eligible: false } } );
	} );

	it( 'reports a failed request as an error', async () => {
		mockApiFetch.mockRejectedValue( new Error( 'boom' ) );

		const result = await getSiteSetupTasksCallback();

		expect( result ).toMatchObject( { result: { success: false, error: 'boom' } } );
	} );

	it( 'resolves task destinations into absolute URLs', async () => {
		mockApiFetch.mockResolvedValue( {
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
		mockApiFetch.mockResolvedValue( {
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
