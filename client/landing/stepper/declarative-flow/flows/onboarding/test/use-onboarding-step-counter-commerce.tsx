/**
 * @jest-environment jsdom
 */
import { NEW_HOSTED_SITE_FLOW } from '@automattic/onboarding';
import { renderHook } from '@testing-library/react';
import { useOnboardingStepCounter } from '../use-onboarding-step-counter';

jest.mock( '@automattic/onboarding', () => ( {
	NEW_HOSTED_SITE_FLOW: 'new-hosted-site',
	ONBOARDING_FLOW: 'onboarding',
} ) );
jest.mock( '@automattic/calypso-products', () => ( {
	isEcommercePlan: ( plan: string ) => plan.startsWith( 'ecommerce-' ),
	PLAN_ECOMMERCE_TRIAL_MONTHLY: 'ecommerce-trial-bundle-monthly',
} ) );
jest.mock( 'calypso/landing/stepper/utils/preselected-plan', () => ( {
	shouldSkipPlansStep: () => false,
} ) );
jest.mock( 'calypso/landing/stepper/stores', () => ( { ONBOARD_STORE: 'ONBOARD_STORE' } ) );

let mockMobile = true;
let mockQuery = new URLSearchParams();
jest.mock( '@wordpress/compose', () => ( {
	useViewportMatch: () => mockMobile,
} ) );
jest.mock( '@wordpress/data', () => ( {
	useSelect: () => null,
} ) );
jest.mock( 'calypso/landing/stepper/utils/get-current-query-params', () => ( {
	getCurrentQueryParams: () => mockQuery,
} ) );

beforeEach( () => {
	mockMobile = true;
	mockQuery = new URLSearchParams(
		'showPurchaseSteps=true&showDomainStep&plan=ecommerce-bundle-2y'
	);
} );

const counter = () =>
	renderHook( () => useOnboardingStepCounter( NEW_HOSTED_SITE_FLOW, 'domains' ) ).result.current;

it( 'shows domains as step one of two on mobile', () => {
	expect( counter() ).toEqual( { current: 1, total: 2 } );
} );

it( 'leaves desktop to the progress overview', () => {
	mockMobile = false;
	expect( counter() ).toBeNull();
} );

it( 'does not change unmarked Commerce visits', () => {
	mockQuery.delete( 'showPurchaseSteps' );
	expect( counter() ).toBeNull();
} );

it( 'does not show the paid two-step journey for a Commerce trial', () => {
	mockQuery.set( 'plan', 'ecommerce-trial-bundle-monthly' );
	expect( counter() ).toBeNull();
} );
