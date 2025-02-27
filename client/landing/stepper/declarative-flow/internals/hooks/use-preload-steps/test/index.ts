/**
 * @jest-environment jsdom
 */
import { SiteDetails } from '@automattic/data-stores';
import { renderHook } from '@testing-library/react';
import { useSelector } from 'calypso/state';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { usePreloadSteps } from '../../use-preload-steps';
import type { Flow } from '../../../types';

// Mock dependencies
jest.mock( 'calypso/state', () => ( {
	useSelector: jest.fn(),
} ) );

jest.mock( 'calypso/state/current-user/selectors', () => ( {
	isUserLoggedIn: jest.fn(),
} ) );

jest.mock( 'debug', () => () => jest.fn() );

describe( 'usePreloadSteps', () => {
	// Mock step components
	const mockAsyncComponent1 = jest.fn().mockResolvedValue( null );
	const mockAsyncComponent2 = jest.fn().mockResolvedValue( null );
	const mockAsyncComponent3 = jest.fn().mockResolvedValue( null );
	const mockUserAsyncComponent = jest.fn().mockResolvedValue( null );

	// Mock flow steps
	const mockFlowSteps = [
		{ slug: 'step1', asyncComponent: mockAsyncComponent1 },
		{ slug: 'step2', asyncComponent: mockAsyncComponent2, requiresLoggedInUser: true },
		{ slug: 'step3', asyncComponent: mockAsyncComponent3 },
		{ slug: 'user', asyncComponent: mockUserAsyncComponent },
	];

	// Mock flow
	const mockFlow = { name: 'test-flow' } as Flow;

	// Add this mock site details object
	const mockSiteDetails = {
		ID: 123,
	} as SiteDetails;

	beforeEach( () => {
		jest.clearAllMocks();
		( useSelector as jest.Mock ).mockImplementation( ( selector ) => {
			if ( selector === isUserLoggedIn ) {
				return false;
			}
			return null;
		} );
	} );

	it( 'should not preload anything if siteSlugOrId is provided but selectedSite is not', () => {
		renderHook( () => usePreloadSteps( 'site-slug', null, 'step1', mockFlowSteps, mockFlow ) );

		expect( mockAsyncComponent1 ).not.toHaveBeenCalled();
		expect( mockAsyncComponent2 ).not.toHaveBeenCalled();
		expect( mockAsyncComponent3 ).not.toHaveBeenCalled();
	} );

	it( 'should preload the next step and the step after that', async () => {
		renderHook( () =>
			usePreloadSteps( 'site-slug', mockSiteDetails, 'step1', mockFlowSteps, mockFlow )
		);

		// Wait for async operations
		await new Promise( ( resolve ) => setTimeout( resolve, 0 ) );

		expect( mockAsyncComponent2 ).toHaveBeenCalled();
		expect( mockAsyncComponent3 ).toHaveBeenCalled();
	} );

	it( 'should preload the user step if any step requires authentication and user is not logged in', async () => {
		renderHook( () =>
			usePreloadSteps( 'site-slug', mockSiteDetails, 'step1', mockFlowSteps, mockFlow )
		);

		// Wait for async operations
		await new Promise( ( resolve ) => setTimeout( resolve, 0 ) );

		expect( mockUserAsyncComponent ).toHaveBeenCalled();
	} );

	it( 'should not preload the user step if user is already logged in', async () => {
		( useSelector as jest.Mock ).mockImplementation( ( selector ) => {
			if ( selector === isUserLoggedIn ) {
				return true;
			}
			return null;
		} );

		renderHook( () =>
			usePreloadSteps( 'site-slug', mockSiteDetails, 'step1', mockFlowSteps, mockFlow )
		);

		// Wait for async operations
		await new Promise( ( resolve ) => setTimeout( resolve, 0 ) );

		expect( mockUserAsyncComponent ).not.toHaveBeenCalled();
	} );

	it( 'should preload the first step requiring authentication when current step is user', async () => {
		renderHook( () =>
			usePreloadSteps( 'site-slug', mockSiteDetails, 'user', mockFlowSteps, mockFlow )
		);

		// Wait for async operations
		await new Promise( ( resolve ) => setTimeout( resolve, 0 ) );

		expect( mockAsyncComponent2 ).toHaveBeenCalled(); // First step requiring authentication
		expect( mockAsyncComponent3 ).toHaveBeenCalled(); // Next step after that
	} );

	it( 'should not preload anything if current step is not found in flow steps', async () => {
		renderHook( () =>
			usePreloadSteps( 'site-slug', mockSiteDetails, 'non-existent-step', mockFlowSteps, mockFlow )
		);

		// Wait for async operations
		await new Promise( ( resolve ) => setTimeout( resolve, 0 ) );

		expect( mockAsyncComponent1 ).not.toHaveBeenCalled();
		expect( mockAsyncComponent2 ).not.toHaveBeenCalled();
		expect( mockAsyncComponent3 ).not.toHaveBeenCalled();
	} );

	it( 'should handle the case when there are no more steps to preload', async () => {
		renderHook( () =>
			usePreloadSteps( 'site-slug', mockSiteDetails, 'step3', mockFlowSteps, mockFlow )
		);

		// Wait for async operations
		await new Promise( ( resolve ) => setTimeout( resolve, 0 ) );

		// No error should be thrown
		expect( mockAsyncComponent1 ).not.toHaveBeenCalled();
		expect( mockAsyncComponent2 ).not.toHaveBeenCalled();
		expect( mockAsyncComponent3 ).not.toHaveBeenCalled(); // Current step, not preloaded
	} );
} );
