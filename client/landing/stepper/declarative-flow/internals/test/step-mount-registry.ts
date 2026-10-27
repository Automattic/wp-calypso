import { lazy } from 'react';
import {
	componentTypeOf,
	describeStepMount,
	recordStepComponentType,
	recordStepRouteMount,
} from '../step-mount-registry';

describe( 'step mount registry', () => {
	it( 'tells a lazy() wrapper from the raw component the preloader swaps in', () => {
		const Raw = () => null;
		expect( componentTypeOf( lazy( () => Promise.resolve( { default: Raw } ) ) ) ).toBe( 'lazy' );
		expect( componentTypeOf( Raw ) ).toBe( 'raw' );
	} );

	it( 'reports nothing for a step it has not seen', () => {
		expect( describeStepMount( 'never-rendered' ) ).toEqual( {
			step_component_type: null,
			ms_since_route_mount: null,
		} );
	} );

	it( 'reports the component type last handed to React and the time since the route mounted', () => {
		const now = jest.spyOn( performance, 'now' );
		now.mockReturnValue( 1000 );
		recordStepRouteMount( 'processing' );
		recordStepComponentType( 'processing', 'lazy' );
		now.mockReturnValue( 1250 );

		expect( describeStepMount( 'processing' ) ).toEqual( {
			step_component_type: 'lazy',
			ms_since_route_mount: 250,
		} );

		recordStepComponentType( 'processing', 'raw' );
		expect( describeStepMount( 'processing' ).step_component_type ).toBe( 'raw' );
		now.mockRestore();
	} );

	it( 'tells whether a step is the only route mounted in the document', () => {
		// A fresh copy, because the routes recorded by the tests above stay in module state.
		jest.isolateModules( () => {
			const registry =
				jest.requireActual< typeof import( '../step-mount-registry' ) >( '../step-mount-registry' );

			expect( registry.isOnlyStepMounted( 'error' ) ).toBe( false );

			registry.recordStepRouteMount( 'error' );
			expect( registry.isOnlyStepMounted( 'error' ) ).toBe( true );
			expect( registry.isOnlyStepMounted( 'processing' ) ).toBe( false );

			registry.recordStepRouteMount( 'processing' );
			expect( registry.isOnlyStepMounted( 'error' ) ).toBe( false );
		} );
	} );
} );
