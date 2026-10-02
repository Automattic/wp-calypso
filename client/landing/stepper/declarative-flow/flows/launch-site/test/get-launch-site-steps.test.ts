import {
	PLAN_ECOMMERCE_TRIAL_MONTHLY,
	PLAN_FREE,
	PLAN_HOSTING_TRIAL_MONTHLY,
	PLAN_MIGRATION_TRIAL_MONTHLY,
	PLAN_PERSONAL,
	PLAN_PERSONAL_TRIAL_MONTHLY,
	PLAN_WOO_HOSTED_FREE_TRIAL_MONTHLY,
} from '@automattic/calypso-products';
import { STEPS } from '../../../internals/steps';
import { getLaunchSiteSteps } from '../get-launch-site-steps';

const wpcomDomain = { wpcom_domain: true };
const customDomain = { wpcom_domain: false };
const plan = ( product_slug: string, is_free = false ) => ( { product_slug, is_free } );

const slugs = ( ...args: Parameters< typeof getLaunchSiteSteps > ) =>
	getLaunchSiteSteps( ...args ).map( ( step ) => step.slug );

const ALL_STEPS = [
	STEPS.DOMAIN_SEARCH.slug,
	STEPS.USE_MY_DOMAIN.slug,
	STEPS.UNIFIED_PLANS.slug,
	STEPS.LAUNCH_SITE.slug,
];

describe( 'getLaunchSiteSteps', () => {
	it( 'asks for a domain and a plan on a free site without a custom domain', () => {
		expect( slugs( { plan: plan( PLAN_FREE, true ) }, [ wpcomDomain ] ) ).toEqual( ALL_STEPS );
	} );

	it( 'skips the domain step when the site already has a custom domain', () => {
		expect( slugs( { plan: plan( PLAN_FREE, true ) }, [ wpcomDomain, customDomain ] ) ).toEqual( [
			STEPS.UNIFIED_PLANS.slug,
			STEPS.LAUNCH_SITE.slug,
		] );
	} );

	it( 'skips the plan step on a paid plan', () => {
		expect( slugs( { plan: plan( PLAN_PERSONAL ) }, [ wpcomDomain ] ) ).toEqual( [
			STEPS.DOMAIN_SEARCH.slug,
			STEPS.USE_MY_DOMAIN.slug,
			STEPS.LAUNCH_SITE.slug,
		] );
	} );

	it( 'keeps the plan step on a free trial', () => {
		expect( slugs( { plan: plan( PLAN_ECOMMERCE_TRIAL_MONTHLY ) }, [ wpcomDomain ] ) ).toContain(
			STEPS.UNIFIED_PLANS.slug
		);
	} );

	it.each( [
		PLAN_PERSONAL_TRIAL_MONTHLY,
		PLAN_ECOMMERCE_TRIAL_MONTHLY,
		PLAN_MIGRATION_TRIAL_MONTHLY,
		PLAN_HOSTING_TRIAL_MONTHLY,
		PLAN_WOO_HOSTED_FREE_TRIAL_MONTHLY,
	] )( 'keeps the plan step on the %s trial', ( trialSlug ) => {
		expect( slugs( { plan: plan( trialSlug ) }, [ customDomain ] ) ).toEqual( [
			STEPS.UNIFIED_PLANS.slug,
			STEPS.LAUNCH_SITE.slug,
		] );
	} );

	it( 'goes straight to the launch with a paid plan and a custom domain', () => {
		expect( slugs( { plan: plan( PLAN_PERSONAL ) }, [ customDomain ] ) ).toEqual( [
			STEPS.LAUNCH_SITE.slug,
		] );
	} );

	it( 'asks for everything when the plan and domains are unknown', () => {
		expect( slugs( {}, null ) ).toEqual( ALL_STEPS );
		expect( slugs( null, undefined ) ).toEqual( ALL_STEPS );
	} );
} );
