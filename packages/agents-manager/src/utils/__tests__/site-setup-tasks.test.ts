/**
 * @jest-environment jsdom
 */
const mockApiFetch = jest.fn();
jest.mock( '@wordpress/api-fetch', () => ( {
	__esModule: true,
	default: ( ...args: unknown[] ) => mockApiFetch( ...args ),
} ) );

import { fetchSiteSetupTasks, getSiteSetupSiteId } from '../site-setup-tasks';

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
