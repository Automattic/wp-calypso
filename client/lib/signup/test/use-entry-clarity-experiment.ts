/**
 * Run with:
 * yarn test-client client/lib/signup/test/use-entry-clarity-experiment.ts
 * @jest-environment jsdom
 */
import { renderHook } from '@testing-library/react';
import { useViewportMatch } from '@wordpress/compose';
import { dangerouslyGetExperimentAssignment, useExperiment } from 'calypso/lib/explat';
import useEntryClarityExperiment, {
	useEntryClarityLoginTreatment,
} from '../use-entry-clarity-experiment';

jest.mock( '@wordpress/compose', () => ( {
	...jest.requireActual( '@wordpress/compose' ),
	useViewportMatch: jest.fn(),
} ) );

jest.mock( 'calypso/lib/explat', () => ( {
	dangerouslyGetExperimentAssignment: jest.fn(),
	useExperiment: jest.fn(),
} ) );

const mockUseViewportMatch = useViewportMatch as unknown as jest.Mock;
const mockUseExperiment = useExperiment as jest.Mock;
const mockGetAssignment = dangerouslyGetExperimentAssignment as jest.Mock;

const assign = ( variationName: string, isLoading = false ) =>
	mockUseExperiment.mockImplementation( ( _name, { isEligible } ) => {
		if ( ! isEligible ) {
			return [ false, null ];
		}
		return [ isLoading, isLoading ? null : { variationName } ];
	} );

describe( 'useEntryClarityExperiment', () => {
	beforeEach( () => {
		mockUseExperiment.mockReset();
		mockUseViewportMatch.mockReturnValue( true );
	} );

	test( 'returns true for an eligible desktop visitor in treatment', () => {
		assign( 'treatment' );
		const { result } = renderHook( () => useEntryClarityExperiment( true ) );

		expect( result.current ).toBe( true );
		expect( mockUseExperiment ).toHaveBeenCalledWith( 'calypso_account_step_entry_clarity_202609', {
			isEligible: true,
		} );
	} );

	test.each( [
		[ 'control', 'control', false ],
		[ 'treatment while the assignment loads', 'treatment', true ],
	] )( 'returns false for %s', ( _label, variationName, isLoading ) => {
		assign( variationName, isLoading );
		const { result } = renderHook( () => useEntryClarityExperiment( true ) );

		expect( result.current ).toBe( false );
	} );

	test( 'does not assign a visitor the caller marks ineligible', () => {
		assign( 'treatment' );
		const { result } = renderHook( () => useEntryClarityExperiment( false ) );

		expect( result.current ).toBe( false );
		expect( mockUseExperiment ).toHaveBeenCalledWith( expect.any( String ), { isEligible: false } );
	} );

	test( 'does not assign a visitor below 960px', () => {
		mockUseViewportMatch.mockReturnValue( false );
		assign( 'treatment' );
		const { result } = renderHook( () => useEntryClarityExperiment( true ) );

		expect( result.current ).toBe( false );
		expect( mockUseExperiment ).toHaveBeenCalledWith( expect.any( String ), { isEligible: false } );
	} );
} );

describe( 'useEntryClarityLoginTreatment', () => {
	beforeEach( () => {
		mockUseExperiment.mockReset();
		mockUseViewportMatch.mockReturnValue( true );
	} );

	test( 'follows a treatment assignment the signup step stored', () => {
		mockGetAssignment.mockReturnValue( { variationName: 'treatment' } );
		const { result } = renderHook( () => useEntryClarityLoginTreatment( true ) );

		expect( result.current ).toBe( true );
		expect( mockUseExperiment ).not.toHaveBeenCalled();
	} );

	test.each( [
		[ 'nothing stored', null, true, true ],
		[ 'a stored control assignment', 'control', true, true ],
		[ 'a visitor the caller marks ineligible', 'treatment', false, true ],
		[ 'a visitor below 960px', 'treatment', true, false ],
	] )( 'returns false for %s', ( _label, variationName, isEligible, isLargeViewport ) => {
		mockGetAssignment.mockReturnValue( { variationName } );
		mockUseViewportMatch.mockReturnValue( isLargeViewport );
		const { result } = renderHook( () => useEntryClarityLoginTreatment( isEligible ) );

		expect( result.current ).toBe( false );
		expect( mockUseExperiment ).not.toHaveBeenCalled();
	} );
} );
