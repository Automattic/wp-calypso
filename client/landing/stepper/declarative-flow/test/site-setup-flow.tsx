/**
 * @jest-environment jsdom
 */
import { renderHookWithProvider } from '../../../../test-helpers/testing-library';
import { STEPS } from '../internals/steps';
import siteSetupFlow from '../site-setup-flow';
import { getFlowLocation, renderFlow } from './helpers';
// we need to save the original object for later to not affect tests from other files
const originalLocation = window.location;

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

	/**
	 * This test is important because site-setup-wg assumes the first two steps are goals and intent capture.
	 * It's totally fine to change this test if the flow changes. But please make sure to update and test the site-setup-wg accordingly.
	 */
	describe( 'First steps should be goals and intent capture', () => {
		const { result } = renderHookWithProvider( () => siteSetupFlow.useSteps() );
		const firstStep = result.current[ 0 ];
		const secondStep = result.current[ 1 ];

		it( 'should be goals', () => {
			expect( firstStep.slug ).toBe( STEPS.GOALS.slug );
		} );

		it( 'should be intent capture', () => {
			expect( secondStep.slug ).toBe( STEPS.INTENT.slug );
		} );
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
} );
