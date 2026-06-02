/**
 * @jest-environment jsdom
 */

jest.mock( 'calypso/lib/explat', () => ( {
	useExperiment: jest.fn(),
} ) );

jest.mock( '@wordpress/compose', () => ( {
	...jest.requireActual( '@wordpress/compose' ),
	useViewportMatch: jest.fn(),
} ) );

jest.mock( 'calypso/landing/stepper/hooks/use-query', () => ( {
	useQuery: jest.fn(),
} ) );

import { renderHook } from '@testing-library/react';
import { useViewportMatch } from '@wordpress/compose';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { useExperiment } from 'calypso/lib/explat';
import useMobileLayoutExperiment from '../use-mobile-layout-experiment';

const mockUseExperiment = useExperiment as jest.Mock;
const mockUseViewportMatch = useViewportMatch as unknown as jest.Mock;
const mockUseQuery = useQuery as jest.Mock;

const renderHookForFlow = ( flow = 'onboarding', isPartnerFlow = false ) =>
	renderHook( () => useMobileLayoutExperiment( { flow, isPartnerFlow } ) );

describe( 'useMobileLayoutExperiment', () => {
	beforeEach( () => {
		jest.resetAllMocks();
		mockUseQuery.mockReturnValue( new URLSearchParams() );
		// Mobile viewport (< small breakpoint, i.e. < 600 px).
		mockUseViewportMatch.mockReturnValue( true );
	} );

	it( 'returns control while the experiment assignment is loading', () => {
		mockUseExperiment.mockReturnValue( [ true, { variationName: 'treatment_tos_top' } ] );

		const { result } = renderHookForFlow();

		expect( result.current.isLoading ).toBe( true );
		expect( result.current.isEligible ).toBe( true );
		expect( result.current.variationName ).toBe( 'control' );
		expect( result.current.isMobileTreatment ).toBe( false );
		expect( result.current.isMobileTreatmentTosTop ).toBe( false );
	} );

	it( 'returns control on non-mobile viewports regardless of assignment', () => {
		mockUseViewportMatch.mockReturnValue( false );
		mockUseExperiment.mockReturnValue( [ false, { variationName: 'treatment_tos_bottom' } ] );

		const { result } = renderHookForFlow();

		expect( result.current.isEligible ).toBe( false );
		expect( result.current.variationName ).toBe( 'control' );
		expect( result.current.isMobileTreatment ).toBe( false );
		expect( result.current.isMobileTreatmentTosTop ).toBe( false );
	} );

	it( 'excludes Woo-referrer users from the experiment', () => {
		mockUseQuery.mockReturnValue( new URLSearchParams( 'ref=woo-hosting-solutions-flow' ) );
		mockUseExperiment.mockReturnValue( [ false, { variationName: 'treatment_tos_top' } ] );

		const { result } = renderHookForFlow();

		expect( result.current.isEligible ).toBe( false );
		expect( result.current.variationName ).toBe( 'control' );
		expect( result.current.isMobileTreatment ).toBe( false );
		expect( result.current.isMobileTreatmentTosTop ).toBe( false );
	} );

	it( 'excludes partner-branded flows from the experiment', () => {
		mockUseExperiment.mockReturnValue( [ false, { variationName: 'treatment_tos_top' } ] );

		const { result } = renderHookForFlow( 'onboarding', true );

		expect( result.current.isEligible ).toBe( false );
		expect( result.current.variationName ).toBe( 'control' );
		expect( result.current.isMobileTreatment ).toBe( false );
		expect( result.current.isMobileTreatmentTosTop ).toBe( false );
	} );

	it( 'excludes flows that do not use step-container-v2', () => {
		mockUseExperiment.mockReturnValue( [ false, { variationName: 'treatment_tos_top' } ] );

		const { result } = renderHookForFlow( 'a-flow-that-does-not-use-step-container-v2' );

		expect( result.current.isEligible ).toBe( false );
		expect( result.current.variationName ).toBe( 'control' );
		expect( result.current.isMobileTreatment ).toBe( false );
	} );

	it( 'exposes treatment_tos_bottom as isMobileTreatment without isMobileTreatmentTosTop', () => {
		mockUseExperiment.mockReturnValue( [ false, { variationName: 'treatment_tos_bottom' } ] );

		const { result } = renderHookForFlow();

		expect( result.current.isLoading ).toBe( false );
		expect( result.current.variationName ).toBe( 'treatment_tos_bottom' );
		expect( result.current.isMobileTreatment ).toBe( true );
		expect( result.current.isMobileTreatmentTosTop ).toBe( false );
	} );

	it( 'exposes treatment_tos_top as both isMobileTreatment and isMobileTreatmentTosTop', () => {
		mockUseExperiment.mockReturnValue( [ false, { variationName: 'treatment_tos_top' } ] );

		const { result } = renderHookForFlow();

		expect( result.current.variationName ).toBe( 'treatment_tos_top' );
		expect( result.current.isMobileTreatment ).toBe( true );
		expect( result.current.isMobileTreatmentTosTop ).toBe( true );
	} );

	it( 'falls back to control when ExPlat returns an unknown variation name', () => {
		mockUseExperiment.mockReturnValue( [
			false,
			{ variationName: 'treatment_unknown_future_arm' },
		] );

		const { result } = renderHookForFlow();

		expect( result.current.isMobileTreatment ).toBe( false );
		expect( result.current.isMobileTreatmentTosTop ).toBe( false );
	} );

	it( 'falls back to control when assignment is null', () => {
		mockUseExperiment.mockReturnValue( [ false, null ] );

		const { result } = renderHookForFlow();

		expect( result.current.variationName ).toBe( 'control' );
		expect( result.current.isMobileTreatment ).toBe( false );
	} );
} );
