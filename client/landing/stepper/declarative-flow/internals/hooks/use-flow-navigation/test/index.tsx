/**
 * @jest-environment jsdom
 */
import { StepperInternalSelect } from '@automattic/data-stores';
import { act, screen } from '@testing-library/react';
import { useSelect } from '@wordpress/data';
import React from 'react';
import { MemoryRouter, useLocation } from 'react-router';
import { renderHookWithProvider } from 'calypso/test-helpers/testing-library';
import { STEPPER_INTERNAL_STORE } from '../../../../../stores';
import { useFlowNavigation } from '../index';

const LocationDisplay = () => {
	const location = useLocation();
	const stepData = useSelect(
		( select ) => ( select( STEPPER_INTERNAL_STORE ) as StepperInternalSelect ).getStepData(),
		[]
	);
	return (
		<>
			<div data-testid="location-display">{ location.pathname + location.search }</div>
			<div data-testid="step-data">{ JSON.stringify( stepData ) }</div>
		</>
	);
};

const Wrapper =
	( initialEntry: string ) =>
	( { children } ) => (
		<MemoryRouter basename="setup" initialEntries={ [ initialEntry ] }>
			<LocationDisplay />
			{ children }
		</MemoryRouter>
	);

const render = ( { initialEntry = '/setup/some-flow/some-step' } = {} ) => {
	return renderHookWithProvider( () => useFlowNavigation(), {
		wrapper: Wrapper( initialEntry ),
	} );
};

const getStepData = () => JSON.parse( screen.getByTestId( 'step-data' ).textContent || '{}' );

describe( 'useFlowNavigation', () => {
	describe( 'params', () => {
		it( 'returns the flow, step and lang based on the url', () => {
			const { result } = render( { initialEntry: '/setup/some-flow/some-step/es' } );

			expect( result.current.params ).toMatchObject( {
				flow: 'some-flow',
				step: 'some-step',
				lang: 'es',
			} );
		} );

		it( 'returns lang null when it is not available', () => {
			const { result } = render( { initialEntry: '/setup/some-flow/some-step' } );

			expect( result.current.params ).toMatchObject( {
				lang: null,
			} );
		} );
	} );

	describe( 'navigate', () => {
		it( 'navigates to the next step', () => {
			const { result } = render();
			const navigate = result.current.navigate;

			act( () => navigate( 'step2' ) );

			expect( screen.getByTestId( 'location-display' ) ).toHaveTextContent( '/some-flow/step2' );
		} );

		it( 'includes the lang when its exists on the current step', () => {
			const { result } = render( { initialEntry: '/setup/some-flow/some-step/es' } );
			const navigate = result.current.navigate;

			act( () => navigate( 'step2' ) );

			expect( screen.getByTestId( 'location-display' ) ).toHaveTextContent( '/some-flow/step2/es' );
		} );

		it( 'uses the existent query params on the new step', () => {
			const { result } = render( { initialEntry: '/setup/some-flow/some-step/?key=value' } );
			const navigate = result.current.navigate;

			act( () => navigate( 'step3' ) );

			expect( screen.getByText( '/some-flow/step3?key=value' ) ).toBeVisible();
		} );

		it( 'replaces the existent query params with new ones when provided', () => {
			const { result } = render( { initialEntry: '/setup/some-flow/some-step/?key=oldValue' } );
			const navigate = result.current.navigate;

			act( () => navigate( 'step3?key=newValue' ) );

			expect( screen.getByText( '/some-flow/step3?key=newValue' ) ).toBeVisible();
		} );

		it( 'stores the previous step in the state', () => {
			const { result } = render();
			const navigate = result.current.navigate;

			act( () => navigate( 'step2' ) );

			expect( getStepData() ).toMatchObject( { previousStep: 'some-step' } );
		} );

		it( 'stores extra data', () => {
			const { result } = render();
			const navigate = result.current.navigate;

			act( () => navigate( 'step2', { extra: 'value' } ) );

			expect( getStepData() ).toMatchObject( { extra: 'value' } );
		} );
	} );
} );
