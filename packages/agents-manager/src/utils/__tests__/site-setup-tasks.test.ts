/**
 * @jest-environment jsdom
 */
const mockApiFetch = jest.fn();
jest.mock( '@wordpress/api-fetch', () => ( {
	__esModule: true,
	default: ( ...args: unknown[] ) => mockApiFetch( ...args ),
} ) );

import {
	fetchSiteSetupTasks,
	getSiteSetupSiteId,
	startSiteSetupTask,
	withSiteSetupTaskStatus,
} from '../site-setup-tasks';

type WindowWithInlineData = Window & { agentsManagerData?: { site?: { ID?: number } } };

describe( 'getSiteSetupSiteId', () => {
	afterEach( () => {
		delete ( window as WindowWithInlineData ).agentsManagerData;
	} );

	it( 'reads the site from the wp-admin payload', () => {
		( window as WindowWithInlineData ).agentsManagerData = { site: { ID: 456 } };
		expect( getSiteSetupSiteId() ).toBe( 456 );
	} );

	it( 'is null without a usable site', () => {
		expect( getSiteSetupSiteId() ).toBeNull();
		( window as WindowWithInlineData ).agentsManagerData = { site: { ID: 0 } };
		expect( getSiteSetupSiteId() ).toBeNull();
	} );
} );

describe( 'fetchSiteSetupTasks', () => {
	it( 'runs the read-only ability with a GET and the site in the query', async () => {
		const result = { eligible: true, tasks: [], progress: { completed: 0, total: 0 }, summary: '' };
		mockApiFetch.mockResolvedValue( result );

		await expect( fetchSiteSetupTasks( 456 ) ).resolves.toBe( result );

		expect( mockApiFetch ).toHaveBeenCalledWith( {
			method: 'GET',
			path: '/wp-abilities/v1/abilities/wpcom/get-site-setup-tasks/run?input%5Bwpcom_site%5D=456',
		} );
	} );
} );

describe( 'withSiteSetupTaskStatus', () => {
	it( 'replaces one task’s status and leaves the rest alone', () => {
		const data = {
			eligible: true,
			tasks: [
				{ id: 'design', title: 'Design', status: 'todo' as const, disabled: false },
				{ id: 'about', title: 'About', status: 'todo' as const, disabled: false },
			],
			progress: { completed: 0, total: 2 },
			summary: '',
		};

		const next = withSiteSetupTaskStatus( data, 'design', 'in-progress' );

		expect( next.tasks.map( ( task ) => task.status ) ).toEqual( [ 'in-progress', 'todo' ] );
		expect( next.progress ).toBe( data.progress );
		expect( data.tasks[ 0 ].status ).toBe( 'todo' );
	} );
} );

describe( 'startSiteSetupTask', () => {
	it( 'runs the write ability with a POST, the site as a string and the task in the body', async () => {
		const result = { task_id: 'design', status: 'in-progress', summary: '' };
		mockApiFetch.mockResolvedValue( result );

		await expect( startSiteSetupTask( 456, 'design' ) ).resolves.toBe( result );

		expect( mockApiFetch ).toHaveBeenCalledWith( {
			method: 'POST',
			path: '/wp-abilities/v1/abilities/wpcom/start-site-setup-task/run',
			data: { input: { wpcom_site: '456', task_id: 'design' } },
		} );
	} );
} );
