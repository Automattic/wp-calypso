/**
 * @jest-environment jsdom
 */
import { renderHook } from '@testing-library/react';
import { useExperiment } from 'calypso/lib/explat';
import { useAiToolExperiment } from '../ai-tool-experiment';

jest.mock( 'calypso/lib/explat', () => ( {
	useExperiment: jest.fn(),
} ) );

const mockUseExperiment = useExperiment as jest.MockedFunction< typeof useExperiment >;

const assignedTo = ( variationName: string | null ) =>
	mockUseExperiment.mockReturnValue( [
		false,
		{
			experimentName: 'calypso_setup_your_site_ai_bring_your_ai_tool_202611',
			variationName,
			retrievedTimestamp: Date.now(),
			ttl: 60,
		},
	] );

describe( 'useAiToolExperiment', () => {
	beforeEach( () => {
		mockUseExperiment.mockReset();
	} );

	it( 'passes eligibility through to the Build with AI experiment', () => {
		mockUseExperiment.mockReturnValue( [ false, null ] );

		renderHook( () => useAiToolExperiment( true ) );
		expect( mockUseExperiment ).toHaveBeenLastCalledWith(
			'calypso_setup_your_site_ai_bring_your_ai_tool_202611',
			{ isEligible: true }
		);

		renderHook( () => useAiToolExperiment( false ) );
		expect( mockUseExperiment ).toHaveBeenLastCalledWith(
			'calypso_setup_your_site_ai_bring_your_ai_tool_202611',
			{ isEligible: false }
		);
	} );

	it( 'puts the bring_your_ai_tool variation in treatment', () => {
		assignedTo( 'bring_your_ai_tool' );

		const { result } = renderHook( () => useAiToolExperiment( true ) );

		expect( result.current ).toEqual( { isLoading: false, isTreatment: true } );
	} );

	it.each( [ 'control', null, 'unknown_variation' ] )(
		'keeps the %s assignment out of treatment',
		( variationName ) => {
			assignedTo( variationName );

			const { result } = renderHook( () => useAiToolExperiment( true ) );

			expect( result.current ).toEqual( { isLoading: false, isTreatment: false } );
		}
	);

	it( 'reports loading until the assignment is back', () => {
		mockUseExperiment.mockReturnValue( [ true, null ] );

		const { result } = renderHook( () => useAiToolExperiment( true ) );

		expect( result.current ).toEqual( { isLoading: true, isTreatment: false } );
	} );
} );
