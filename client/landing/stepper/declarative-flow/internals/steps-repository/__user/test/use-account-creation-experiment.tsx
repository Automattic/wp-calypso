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
import useAccountCreationExperiment from '../use-account-creation-experiment';

const mockUseExperiment = useExperiment as jest.Mock;
const mockUseViewportMatch = useViewportMatch as unknown as jest.Mock;
const mockUseQuery = useQuery as jest.Mock;

describe( 'useAccountCreationExperiment', () => {
	beforeEach( () => {
		jest.resetAllMocks();
		mockUseQuery.mockReturnValue( new URLSearchParams() );
		mockUseViewportMatch.mockReturnValue( true );
	} );

	it( 'returns control while the experiment assignment is loading', () => {
		mockUseExperiment.mockReturnValue( [ true, { variationName: 'treatment_email_slider_webp' } ] );

		const { result } = renderHook( () => useAccountCreationExperiment( { flow: 'onboarding' } ) );

		expect( result.current.isLoading ).toBe( true );
		expect( result.current.variationName ).toBe( 'control' );
		expect( result.current.isEmailFirstVariant ).toBe( false );
		expect( result.current.isEmailAtBottom ).toBe( false );
	} );

	it( 'returns control on sub-960 px viewports regardless of assignment', () => {
		mockUseViewportMatch.mockReturnValue( false );
		mockUseExperiment.mockReturnValue( [
			false,
			{ variationName: 'treatment_email_bottom_slider_webp' },
		] );

		const { result } = renderHook( () => useAccountCreationExperiment( { flow: 'onboarding' } ) );

		expect( result.current.variationName ).toBe( 'control' );
		expect( result.current.isEmailFirstVariant ).toBe( false );
		expect( result.current.isEmailAtBottom ).toBe( false );
	} );
} );
