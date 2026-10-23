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
		const { result } = renderHook( () => usePlansGridRedesignExperiment( { isInSignup: true } ) );

		expect( result.current ).toEqual( REDESIGN_RESULT );
	} );

	test( 'hides the differentiator header on logged-in plans pages', () => {
		const { result } = renderHook( () => usePlansGridRedesignExperiment( { isInSignup: false } ) );

		expect( result.current ).toEqual( {
			...REDESIGN_RESULT,
			showDifferentiatorHeader: false,
		} );
	} );
} );
