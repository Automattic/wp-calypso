/**
 * @jest-environment jsdom
 */
import { isCurrentUserLoggedIn } from '@automattic/data-stores/src/user/selectors';
import { useIsSiteOwner } from 'calypso/landing/stepper/hooks/use-is-site-owner';
import { goToCheckout } from '../../utils/checkout';
import { STEPS } from '../internals/steps';
import migrationSignupFlow from '../migration-signup';
import { getFlowLocation, renderFlow } from './helpers';
// we need to save the original object for later to not affect tests from other files
const originalLocation = window.location;

jest.mock( '../../utils/checkout' );
jest.mock( '@automattic/data-stores/src/user/selectors' );
jest.mock( 'calypso/landing/stepper/hooks/use-is-site-owner' );

describe( 'Migration Signup Flow', () => {
	beforeAll( () => {
		Object.defineProperty( window, 'location', {
			value: { ...originalLocation, assign: jest.fn() },
		} );
	} );

	afterAll( () => {
		Object.defineProperty( window, 'location', originalLocation );
	} );

	beforeEach( () => {
		( window.location.assign as jest.Mock ).mockClear();
		( isCurrentUserLoggedIn as jest.Mock ).mockReturnValue( true );
		( useIsSiteOwner as jest.Mock ).mockReturnValue( {
			isOwner: true,
		} );
	} );

	describe( 'useAssertConditions', () => {
		it( 'redirects the user to the login page when they are not logged in', () => {
			( isCurrentUserLoggedIn as jest.Mock ).mockReturnValue( false );

			const { runUseAssertionCondition } = renderFlow( migrationSignupFlow );
			runUseAssertionCondition( {
				currentStep: STEPS.SITE_MIGRATION_IDENTIFY.slug,
			} );

			expect( window.location.assign ).toHaveBeenCalledWith(
				`/start/account/user-social?variationName=migration-signup&toStepper=true&redirect_to=/setup/migration-signup`
			);
		} );
	} );

	describe( 'useStepNavigation', () => {
		it( 'redirects the user to the processing step from the create-site step', () => {
			const { runUseStepNavigationSubmit } = renderFlow( migrationSignupFlow );

			runUseStepNavigationSubmit( {
				currentStep: STEPS.SITE_CREATION_STEP.slug,
				currentURL: `/setup/create-site`,
			} );

			expect( getFlowLocation() ).toEqual( {
				path: `/${ STEPS.PROCESSING.slug }?siteSlug=`,
				state: null,
			} );
		} );

		it( 'redirects the user to the site-migration-upgrade-plan step from the processing step', () => {
			const { runUseStepNavigationSubmit } = renderFlow( migrationSignupFlow );

			runUseStepNavigationSubmit( {
				currentStep: STEPS.PROCESSING.slug,
				currentURL: `/setup/${ STEPS.PROCESSING.slug }?siteSlug=`,
				dependencies: {
					siteSlug: 'example.wordpress.com',
					siteId: 123,
				},
			} );

			expect( getFlowLocation() ).toEqual( {
				path: `/${ STEPS.SITE_MIGRATION_UPGRADE_PLAN.slug }?siteSlug=example.wordpress.com`,
				state: {
					hideFreeMigrationTrialForNonVerifiedEmail: true,
				},
			} );
		} );

		it( 'redirects the user to the checkout page with the correct destination params', () => {
			const { runUseStepNavigationSubmit } = renderFlow( migrationSignupFlow );

			runUseStepNavigationSubmit( {
				currentURL: `/setup/${ STEPS.SITE_MIGRATION_UPGRADE_PLAN.slug }?siteSlug=example.wordpress.com`,
				currentStep: STEPS.SITE_MIGRATION_UPGRADE_PLAN.slug,
				dependencies: {
					goToCheckout: true,
					plan: 'plan',
				},
			} );

			expect( goToCheckout ).toHaveBeenCalledWith( {
				destination: `/setup/migration-signup/${ STEPS.BUNDLE_TRANSFER.slug }?siteSlug=example.wordpress.com`,
				flowName: 'migration-signup',
				siteSlug: 'example.wordpress.com',
				plan: 'plan',
				stepName: STEPS.SITE_MIGRATION_UPGRADE_PLAN.slug,
			} );
		} );

		it( 'redirects the user to the processing step from the site creation step', () => {
			const { runUseStepNavigationSubmit } = renderFlow( migrationSignupFlow );

			runUseStepNavigationSubmit( {
				currentStep: STEPS.SITE_CREATION_STEP.slug,
				currentURL: `/setup/${ STEPS.SITE_CREATION_STEP.slug }?siteSlug=example.wordpress.com`,
			} );

			expect( getFlowLocation() ).toEqual( {
				path: `/${ STEPS.PROCESSING.slug }?siteSlug=example.wordpress.com`,
				state: null,
			} );
		} );
	} );
} );
