/**
 * @jest-environment jsdom
 */
import { SiteIntent } from '@automattic/data-stores/src/onboard/constants';
import { ONBOARDING_FLOW } from '@automattic/onboarding';
import { STEPS } from '../internals/steps';
import onboarding from '../onboarding';
import { getFlowLocation, renderFlow } from './helpers';

const originalLocation = window.location;

describe( 'Onboarding Flow', () => {
	beforeAll( () => {
		Object.defineProperty( window, 'location', {
			value: {
				assign: jest.fn(),
				replace: jest.fn(),
				pathname: '/setup/onboarding',
				search: '',
				href: 'http://wordpress.com/setup/onboarding',
			},
			writable: true,
		} );
	} );

	afterAll( () => {
		Object.defineProperty( window, 'location', originalLocation );
	} );

	beforeEach( () => {
		jest.resetAllMocks();
	} );

	describe( 'Flow configuration', () => {
		it( 'should be configured as a signup flow', () => {
			expect( onboarding.name ).toBe( ONBOARDING_FLOW );
			expect( onboarding.isSignupFlow ).toBe( true );
		} );
	} );

	describe( 'Goals step navigation', () => {
		it( 'should redirect to migration flow when intent is Import', async () => {
			const { runUseStepNavigationSubmit } = renderFlow( onboarding );

			runUseStepNavigationSubmit( {
				currentStep: STEPS.GOALS.slug,
				dependencies: {
					intent: SiteIntent.Import,
				},
			} );

			expect( window.location.assign ).toHaveBeenCalledWith(
				'/setup/hosted-site-migration?back_to=%2Fsetup%2Fonboarding%2Fgoals'
			);
		} );

		it( 'should redirect to DIFM flow when intent is DIFM', async () => {
			const { runUseStepNavigationSubmit } = renderFlow( onboarding );

			runUseStepNavigationSubmit( {
				currentStep: STEPS.GOALS.slug,
				dependencies: {
					intent: SiteIntent.DIFM,
				},
			} );

			expect( getFlowLocation().path ).toBe( '/difmStartingPoint' );
		} );

		it( 'should navigate to designSetup step for other intents', async () => {
			const { runUseStepNavigationSubmit } = renderFlow( onboarding );

			runUseStepNavigationSubmit( {
				currentStep: STEPS.GOALS.slug,
				dependencies: {
					intent: SiteIntent.Write,
				},
			} );

			expect( getFlowLocation().path ).toBe( '/designSetup' );
		} );
	} );
} );
