/**
 * @jest-environment jsdom
 */
// @ts-nocheck - TODO: Fix TypeScript issues
import { clearSignupDestinationCookie } from 'calypso/signup/storageUtils';
import siteSetupFlow from '../flows/site-setup-flow/site-setup-flow';
import { STEPS } from '../internals/steps';
import { getFlowLocation, renderFlow } from './helpers';
// we need to save the original object for later to not affect tests from other files
const originalLocation = window.location;

// Mock the signup utils
jest.mock( 'calypso/signup/storageUtils', () => ( {
	clearSignupDestinationCookie: jest.fn(),
} ) );

describe( 'Site Setup Flow', () => {
	beforeAll( () => {
		Object.defineProperty( window, 'location', {
			value: { assign: jest.fn(), pathname: '' },
		} );
	} );

	afterAll( () => {
		Object.defineProperty( window, 'location', originalLocation );
	} );

	beforeEach( () => {
		jest.resetAllMocks();
	} );

	describe( 'when the current step is importListing', () => {
		it( 'redirects the user to the site-migration-import-or-content step when the origin param is set as site-migration-identify', async () => {
			const { runUseStepNavigationSubmit } = renderFlow( siteSetupFlow );

			runUseStepNavigationSubmit( {
				currentURL:
					'/some-path?origin=site-migration-identify&siteSlug=example.wordpress.com&siteId=123',
				currentStep: STEPS.IMPORT_LIST.slug,
				dependencies: {
					platform: 'wordpress',
				},
			} );

			expect( window.location.assign ).toHaveBeenCalledWith(
				'/setup/site-migration/site-migration-import-or-migrate?siteSlug=example.wordpress.com&siteId=123'
			);
		} );

		it( 'continues the regular flow when the origin param is not available', async () => {
			const { runUseStepNavigationSubmit } = renderFlow( siteSetupFlow );

			runUseStepNavigationSubmit( {
				currentStep: STEPS.IMPORT_LIST.slug,
				dependencies: {
					platform: 'wordpress',
				},
			} );

			expect( window.location.assign ).not.toHaveBeenCalledWith(
				expect.stringContaining( '/setup/site-migration/' )
			);
		} );
	} );

	//It is important because importReady and importListing are sharing the same logic
	describe( 'when the current step is not importReady', () => {
		it( 'ignores origin param', async () => {
			const { runUseStepNavigationSubmit } = renderFlow( siteSetupFlow );

			runUseStepNavigationSubmit( {
				currentURL:
					'/some-path?origin=site-migration-identify&siteSlug=example.wordpress.com&siteId=123',
				currentStep: STEPS.IMPORT_READY.slug,
				dependencies: {
					platform: 'wordpress',
				},
			} );

			expect( window.location.assign ).not.toHaveBeenCalledWith(
				expect.stringContaining( '/setup/site-migration/' )
			);
		} );
	} );

	describe( 'goBack', () => {
		it( 'redirects the user to preview STEP using the regular flow', () => {
			const { runUseStepNavigationGoBack } = renderFlow( siteSetupFlow );

			runUseStepNavigationGoBack( {
				currentStep: STEPS.IMPORT_LIST.slug,
			} );

			expect( getFlowLocation() ).toEqual( {
				path: '/import?siteSlug=example.wordpress.com',
				state: null,
			} );
		} );

		it( 'redirects the users to previous FLOW when backToFlow is defined', () => {
			const { runUseStepNavigationGoBack } = renderFlow( siteSetupFlow );

			runUseStepNavigationGoBack( {
				currentURL: '/some-path?backToFlow=some-flow/some-step',
				currentStep: STEPS.IMPORT_LIST.slug,
			} );

			expect( window.location.assign ).toHaveBeenCalledWith(
				expect.stringContaining( '/setup/some-flow/some-step' )
			);
		} );
	} );

	describe( 'when finishing the Site Setup Flow', () => {
		beforeEach( () => {
			jest.clearAllMocks();
		} );

		it( 'exitFlow should clear signup destination cookie', () => {
			const { runUseStepNavigationSubmit } = renderFlow( siteSetupFlow );

			runUseStepNavigationSubmit( {
				currentStep: 'processing',
				dependencies: {
					processingResult: 'success',
				},
			} );

			// Verify the cookie was cleared
			expect( clearSignupDestinationCookie ).toHaveBeenCalled();
		} );
	} );
} );
