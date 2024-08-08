/**
 * @jest-environment jsdom
 */
import { URLSearchParams } from 'url';
import { isCurrentUserLoggedIn } from '@automattic/data-stores/src/user/selectors';
import { addQueryArgs } from '@wordpress/url';
import { useIsSiteOwner } from 'calypso/landing/stepper/hooks/use-is-site-owner';
import { goToCheckout } from 'calypso/landing/stepper/utils/checkout';
import flow from '../';
import { STEPS } from '../../internals/steps';
import { getFlowLocation, renderFlow } from '../../test/helpers';

// we need to save the original object for later to not affect tests from other files
const originalLocation = window.location;

jest.mock( '@automattic/data-stores/src/user/selectors' );
jest.mock( 'calypso/landing/stepper/hooks/use-is-site-owner' );
jest.mock( 'calypso/landing/stepper/utils/checkout' );

describe( `${ flow.name }`, () => {
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

		window.location.search = '';
	} );

	const runNavigation = ( { from, dependencies = {}, query = {} } ) => {
		const { runUseStepNavigationSubmit } = renderFlow( flow );

		runUseStepNavigationSubmit( {
			currentStep: from.slug,
			dependencies: dependencies,
			currentURL: addQueryArgs( `/setup/${ from.slug }`, query ),
		} );

		const destination = getFlowLocation();
		const [ pathname, searchParams ] = destination?.path?.split( '?' ) ?? [ '', '' ];

		return {
			step: pathname.replace( /^\/+/, '' ),
			query: new URLSearchParams( searchParams ),
		};
	};

	describe( 'useStepNavigation', () => {
		it( 'redirects the user from platform identification to create site step', () => {
			const destination = runNavigation( {
				from: STEPS.PLATFORM_IDENTIFICATION,
				dependencies: { platform: 'any-platform', next: 'next-url' },
			} );

			expect( destination ).toMatchDestination( {
				step: STEPS.SITE_CREATION_STEP,
				query: { platform: 'any-platform', next: 'next-url' },
			} );
		} );

		it( 'redirects the user from platform identification to create site step without passing the next when the user select WordPress', () => {
			const destination = runNavigation( {
				from: STEPS.PLATFORM_IDENTIFICATION,
				dependencies: { platform: 'wordpress', next: 'next-url' },
			} );

			expect( destination ).toMatchDestination( {
				step: STEPS.SITE_CREATION_STEP,
				query: { platform: 'wordpress' },
			} );
		} );

		it( 'redirects user from site-create to processing passing the platform', () => {
			const destination = runNavigation( {
				from: STEPS.SITE_CREATION_STEP,
				query: { platform: 'any-platform' },
			} );

			expect( destination ).toMatchDestination( {
				step: STEPS.PROCESSING,
				query: { platform: 'any-platform' },
			} );
		} );

		it( 'redirect user from processing to the import file when the platform is not wordpress', () => {
			runNavigation( {
				from: STEPS.PROCESSING,
				query: {
					platform: 'blogger',
					next: 'importBlogger',
					siteId: 123,
					siteSlug: 'example.wordpress.com',
				},
			} );

			expect( window.location.assign ).toHaveBeenCalledWith(
				'/setup/site-setup/importBlogger?siteId=123&siteSlug=example.wordpress.com'
			);
		} );

		it( 'redirect user from processing to the upgrade plan when the platform is wordpress', () => {
			const destination = runNavigation( {
				from: STEPS.PROCESSING,
				query: { platform: 'wordpress' },
				dependencies: { siteSlug: 'example.wordpress.com', siteId: 123 },
			} );

			expect( destination ).toMatchDestination( {
				step: STEPS.SITE_MIGRATION_UPGRADE_PLAN,
				query: { siteId: 123, siteSlug: 'example.wordpress.com' },
			} );
		} );

		it( 'redirects user from Upgrade plan > Checkout page', () => {
			runNavigation( {
				from: STEPS.SITE_MIGRATION_UPGRADE_PLAN,
				query: { siteId: 123, siteSlug: 'example.wordpress.com' },
				dependencies: { goToCheckout: true, plan: 'business', userAcceptedDeal: false },
			} );

			expect( goToCheckout ).toHaveBeenCalledWith( {
				destination: `/setup/hosted-site-migration-v2/site-migration-how-to-migrate?siteSlug=example.wordpress.com&siteId=123`,
				extraQueryParams: {},
				flowName: 'hosted-site-migration-v2',
				siteSlug: 'example.wordpress.com',
				stepName: STEPS.SITE_MIGRATION_UPGRADE_PLAN.slug,
				cancelDestination: `/setup/hosted-site-migration-v2/site-migration-upgrade-plan?siteId=123&siteSlug=example.wordpress.com`,
				plan: 'business',
			} );
		} );
	} );
} );
