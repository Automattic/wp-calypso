/**
 * @jest-environment jsdom
 */

jest.mock( 'calypso/landing/stepper/hooks/use-query', () => ( {
	useQuery: jest.fn(),
} ) );

import { renderHook } from '@testing-library/react';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import useSelectedPlanCard from '../use-selected-plan-card';

const mockUseQuery = useQuery as jest.Mock;

describe( 'useSelectedPlanCard', () => {
	it( 'shows the card when the URL asks for it and preselects a plan', () => {
		mockUseQuery.mockReturnValue(
			new URLSearchParams( 'plan=business-bundle&showSelectedPlan=true' )
		);

		const { result } = renderHook( () => useSelectedPlanCard( { flow: 'onboarding' } ) );

		expect( result.current ).toEqual( { planSlug: 'business-bundle', showPlanCard: true } );
	} );

	it( 'shows the card on the new-hosted-site flow with a Commerce plan', () => {
		mockUseQuery.mockReturnValue(
			new URLSearchParams( 'plan=ecommerce-bundle&showSelectedPlan=true' )
		);

		const { result } = renderHook( () => useSelectedPlanCard( { flow: 'new-hosted-site' } ) );

		expect( result.current ).toEqual( { planSlug: 'ecommerce-bundle', showPlanCard: true } );
	} );

	it( 'hides the card without the showSelectedPlan parameter', () => {
		mockUseQuery.mockReturnValue( new URLSearchParams( 'plan=business-bundle' ) );

		const { result } = renderHook( () => useSelectedPlanCard( { flow: 'onboarding' } ) );

		expect( result.current ).toEqual( { planSlug: 'business-bundle', showPlanCard: false } );
	} );

	it( 'hides the card when the parameter is not exactly "true"', () => {
		mockUseQuery.mockReturnValue( new URLSearchParams( 'plan=business-bundle&showSelectedPlan' ) );

		const { result } = renderHook( () => useSelectedPlanCard( { flow: 'onboarding' } ) );

		expect( result.current.showPlanCard ).toBe( false );
	} );

	it( 'hides the card without a preselected plan', () => {
		mockUseQuery.mockReturnValue( new URLSearchParams( 'showSelectedPlan=true' ) );

		const { result } = renderHook( () => useSelectedPlanCard( { flow: 'onboarding' } ) );

		expect( result.current ).toEqual( { planSlug: null, showPlanCard: false } );
	} );

	it( 'hides the card on flows other than onboarding and new-hosted-site', () => {
		mockUseQuery.mockReturnValue(
			new URLSearchParams( 'plan=business-bundle&showSelectedPlan=true' )
		);

		const { result } = renderHook( () => useSelectedPlanCard( { flow: 'site-setup' } ) );

		expect( result.current ).toEqual( { planSlug: null, showPlanCard: false } );
	} );
} );
