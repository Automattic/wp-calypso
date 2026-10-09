/**
 * @jest-environment jsdom
 */
jest.mock( '@wordpress/compose', () => ( {
	...jest.requireActual( '@wordpress/compose' ),
	useViewportMatch: jest.fn(),
} ) );

import { renderHook } from '@testing-library/react';
import { useViewportMatch } from '@wordpress/compose';
import {
	hasPreselectedPurchasePlan,
	useShowOnboardingProgress,
} from '../use-show-onboarding-progress';

const mockViewport = useViewportMatch as unknown as jest.Mock;

describe( 'useShowOnboardingProgress', () => {
	beforeEach( () => {
		mockViewport.mockReset();
		window.history.replaceState( {}, '', '/' );
	} );

	it( 'shows on desktop onboarding', () => {
		mockViewport.mockReturnValue( true );
		const { result } = renderHook( () => useShowOnboardingProgress( true ) );
		expect( result.current ).toBe( true );
	} );

	it( 'hides when not onboarding flow', () => {
		mockViewport.mockReturnValue( true );
		const { result } = renderHook( () => useShowOnboardingProgress( false ) );
		expect( result.current ).toBe( false );
	} );

	it( 'hides on mobile', () => {
		mockViewport.mockReturnValue( false );
		const { result } = renderHook( () => useShowOnboardingProgress( true ) );
		expect( result.current ).toBe( false );
	} );
} );

it.each( [ 'new-hosted-site', 'another-flow' ] )(
	'opts in %s without a plan restriction',
	( flow ) => {
		window.history.replaceState( {}, '', `/setup/${ flow }/domains?showPurchaseSteps=true` );
		mockViewport.mockReturnValue( true );
		expect( renderHook( () => useShowOnboardingProgress( false ) ).result.current ).toBe( true );
	}
);

it.each( [ '', 'false', '1' ] )( 'does not opt in with value %s', ( value ) => {
	window.history.replaceState( {}, '', `/?showPurchaseSteps=${ value }` );
	mockViewport.mockReturnValue( true );
	expect( renderHook( () => useShowOnboardingProgress( false ) ).result.current ).toBe( false );
} );

it( 'keeps parameter-enabled progress off mobile', () => {
	window.history.replaceState( {}, '', '/?showPurchaseSteps=true' );
	mockViewport.mockReturnValue( false );
	expect( renderHook( () => useShowOnboardingProgress( false ) ).result.current ).toBe( false );
} );

it.each( [ 'personal-bundle', 'value_bundle', 'business-bundle', 'ecommerce-bundle' ] )(
	'hides a preselected %s plan only when the cart agrees',
	( plan ) => {
		const query = new URLSearchParams( { showPurchaseSteps: 'true', plan } );
		expect( hasPreselectedPurchasePlan( query, { product_slug: plan } ) ).toBe( true );
		expect( hasPreselectedPurchasePlan( query, null ) ).toBe( false );
		expect( hasPreselectedPurchasePlan( query, { product_slug: 'other' } ) ).toBe( false );
		query.delete( 'showPurchaseSteps' );
		expect( hasPreselectedPurchasePlan( query, { product_slug: plan } ) ).toBe( false );
	}
);

it.each( [ 'ecommerce-trial-bundle-monthly', 'invalid' ] )(
	'keeps the plans step for %s',
	( plan ) => {
		const query = new URLSearchParams( { showPurchaseSteps: 'true', plan } );
		expect( hasPreselectedPurchasePlan( query, { product_slug: plan } ) ).toBe( false );
	}
);
