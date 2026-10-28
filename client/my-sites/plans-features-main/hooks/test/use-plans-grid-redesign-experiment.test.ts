/**
 * @jest-environment jsdom
 */
import { renderHook } from '@testing-library/react';
import usePlansGridRedesignExperiment from '../use-plans-grid-redesign-experiment';

const REDESIGN_RESULT = {
	isLoading: false,
	usePlansGridRedesign: true,
	usePlansGridRedesignNewDescription: true,
	showDifferentiatorHeader: true,
	usePlansGridRedesignFeatures: true,
	showEnterpriseBottomCard: false,
	showWooCommerceBottomCard: false,
};

describe( 'usePlansGridRedesignExperiment', () => {
	test( 'enables the redesigned descriptions, features and differentiator header in signup', () => {
		const { result } = renderHook( () =>
			usePlansGridRedesignExperiment( { isInSignup: true, intent: 'plans-default-wpcom' } )
		);

		expect( result.current ).toEqual( REDESIGN_RESULT );
	} );

	test( 'hides the differentiator header on logged-in plans pages', () => {
		const { result } = renderHook( () =>
			usePlansGridRedesignExperiment( { isInSignup: false, intent: 'plans-default-wpcom' } )
		);

		expect( result.current ).toEqual( {
			...REDESIGN_RESULT,
			showDifferentiatorHeader: false,
		} );
	} );

	test.each( [
		'plans-newsletter',
		'plans-blog-onboarding',
		'plans-woo-hosting-solutions',
		'plans-wordpress-hosting',
		'plans-p2',
	] as const )( 'hides the differentiator header in signup for the %s intent', ( intent ) => {
		const { result } = renderHook( () =>
			usePlansGridRedesignExperiment( { isInSignup: true, intent } )
		);

		expect( result.current.showDifferentiatorHeader ).toBe( false );
	} );

	test( 'hides the differentiator header in signup while the intent is still unresolved', () => {
		const { result } = renderHook( () =>
			usePlansGridRedesignExperiment( { isInSignup: true, intent: undefined } )
		);

		expect( result.current.showDifferentiatorHeader ).toBe( false );
	} );
} );
