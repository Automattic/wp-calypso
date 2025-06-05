/**
 * @jest-environment jsdom
 */
// @ts-nocheck - TODO: Fix TypeScript issues
import { StepperInternalSelect } from '@automattic/data-stores';
import { act, screen } from '@testing-library/react';
import { useSelect } from '@wordpress/data';
import React from 'react';
import { MemoryRouter, useLocation } from 'react-router';
import { renderHookWithProvider } from 'calypso/test-helpers/testing-library';
import { STEPPER_INTERNAL_STORE } from '../../../../../stores';
import { Flow } from '../../../types';
import { useFlowNavigation } from '../index';

const mockFlow: Flow = {
	name: 'some-flow',
	isSignupFlow: false,
	useSteps() {
		return [
			{
				slug: 'some-step',
				asyncComponent: () => Promise.resolve( { default: () => <div>Step 1</div> } ),
			},
		];
	},
	useStepNavigation() {
		return {};
	},
};

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
	window.history.replaceState( null, '', initialEntry );
	return renderHookWithProvider( () => useFlowNavigation( mockFlow ), {
		wrapper: Wrapper( initialEntry ),
	} );
};

const renderWithBuiltInAuth = ( { initialEntry = '/setup/some-flow/some-step' } = {} ) => {
	window.history.replaceState( null, '', initialEntry );
	return renderHookWithProvider(
		() => useFlowNavigation( { ...mockFlow, __experimentalUseBuiltinAuth: true } ),
		{
			wrapper: Wrapper( initialEntry ),
		}
	);
};

const getStepData = () => JSON.parse( screen.getByTestId( 'step-data' ).textContent || '{}' );

[ render, renderWithBuiltInAuth ].forEach( ( render ) => {
	describe( 'useFlowNavigation', () => {
		describe( 'params', () => {
			it( 'returns the flow and step the url', () => {
				const { result } = render( { initialEntry: '/setup/some-flow/some-step/es' } );

				expect( result.current.params ).toMatchObject( {
					flow: 'some-flow',
					step: 'some-step',
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

			it( 'navigates to the next step when there is not step in the url', () => {
				const { result } = render( { initialEntry: '/setup/some-flow' } );
				const navigate = result.current.navigate;

				act( () => navigate( 'step2' ) );

				expect( screen.getByTestId( 'location-display' ) ).toHaveTextContent( '/some-flow/step2' );
			} );

			it( 'includes the lang when its exists on the current step', () => {
				const { result } = render( { initialEntry: '/setup/some-flow/some-step/es' } );
				const navigate = result.current.navigate;

				act( () => navigate( 'step2' ) );

				expect( screen.getByTestId( 'location-display' ) ).toHaveTextContent(
					'/some-flow/step2/es'
				);
			} );

			it( 'includes any existing query params', () => {
				const { result } = render( { initialEntry: '/setup/some-flow/some-step?randomKey=value' } );
				const navigate = result.current.navigate;

				act( () => navigate( 'step2' ) );

				expect( screen.getByTestId( 'location-display' ) ).toHaveTextContent(
					'/some-flow/step2?randomKey=value'
				);
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
} );
