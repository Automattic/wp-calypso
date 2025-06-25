/**
 * @jest-environment jsdom
 */
// @ts-nocheck - TODO: Fix TypeScript issues
import { updateLaunchpadSettings } from '@automattic/data-stores';
import { skipLaunchpad } from '../skip-launchpad';

// Mock the data-stores module
jest.mock( '@automattic/data-stores', () => ( {
	updateLaunchpadSettings: jest.fn(),
} ) );

describe( 'skipLaunchpad', () => {
	beforeEach( () => {
		// Clear all mocks before each test
		jest.clearAllMocks();
		// Properly mock window.location
		delete window.location;
		window.location = { assign: jest.fn() } as unknown as Location;
	} );

	it( 'should update launchpad settings and redirect to siteId by default', async () => {
		await skipLaunchpad( { siteId: '123', siteSlug: null } );

		expect( updateLaunchpadSettings ).toHaveBeenCalledWith( '123', {
			launchpad_screen: 'skipped',
		} );
		expect( window.location.assign ).toHaveBeenCalledWith( '/home/123' );
	} );

	it( 'should update launchpad settings and redirect to siteSlug by default', async () => {
		await skipLaunchpad( { siteId: null, siteSlug: 'test-site' } );

		expect( updateLaunchpadSettings ).toHaveBeenCalledWith( 'test-site', {
			launchpad_screen: 'skipped',
		} );
		expect( window.location.assign ).toHaveBeenCalledWith( '/home/test-site' );
	} );

	it( 'should not redirect when redirectToHome is false', async () => {
		await skipLaunchpad( { siteId: '123', siteSlug: null, redirectToHome: false } );

		expect( updateLaunchpadSettings ).toHaveBeenCalledWith( '123', {
			launchpad_screen: 'skipped',
		} );
		expect( window.location.assign ).not.toHaveBeenCalled();
	} );
} );
