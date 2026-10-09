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
	useSelect: () => ( { product_slug: mockQuery.get( 'plan' ) } ),
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
	renderHook( () => useOnboardingStepCounter( NEW_HOSTED_SITE_FLOW, 'domains', true ) ).result
		.current;

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

it( 'keeps the plan step unless the flow requests otherwise', () => {
	expect(
		renderHook( () => useOnboardingStepCounter( NEW_HOSTED_SITE_FLOW, 'domains' ) ).result.current
	).toEqual( { current: 1, total: 3 } );
} );

it( 'supports another flow without a preselected plan', () => {
	mockQuery = new URLSearchParams( 'showPurchaseSteps=true' );
	expect(
		renderHook( () => useOnboardingStepCounter( 'another-flow', 'domains' ) ).result.current
	).toEqual( { current: 1, total: 3 } );
} );

it( 'does not invent a counter for an unsupported step', () => {
	expect(
		renderHook( () => useOnboardingStepCounter( 'another-flow', 'processing' ) ).result.current
	).toBeNull();
} );
