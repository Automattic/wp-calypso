/**
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import React from 'react';
import { renderHook, act as actReactHooks } from '@testing-library/react-hooks';
import { render, act as actReact, waitFor } from '@testing-library/react';

/**
 * WordPress dependencies
 */
import type { ExPlatClient, ExperimentAssignment } from '@automattic/explat-client';
import { validExperimentAssignment } from '@automattic/explat-client/src/internal/test-common';

/**
 * Internal dependencies
 */
import createExPlatClientReactHelpers from '../index';

const createMockExPlatClient = ( isDevelopmentMode = false ): ExPlatClient => ( {
	loadExperimentAssignment: jest.fn(),
	dangerouslyGetExperimentAssignment: jest.fn(),
	config: {
		isDevelopmentMode,
		logError: jest.fn(),
		fetchExperimentAssignment: jest.fn(),
		getAnonId: jest.fn(),
	},
} );

const createControllablePromise = function < T >() {
	let resOuter;
	let rejOuter;

	const promise = new Promise< T >( ( resolve, reject ) => {
		resOuter = resolve;
		rejOuter = reject;
	} );

	return {
		resolve: ( resOuter as unknown ) as ( T ) => void,
		reject: ( rejOuter as unknown ) as ( ...x: unknown[] ) => void,
		promise,
	};
};

describe( 'useExperiment', () => {
	it( 'should correctly load an experiment assignment', async () => {
		const exPlatClient = createMockExPlatClient();
		const { useExperiment } = createExPlatClientReactHelpers( exPlatClient );

		const controllablePromise1 = createControllablePromise< ExperimentAssignment >();
		( exPlatClient.loadExperimentAssignment as jest.MockedFunction<
			typeof exPlatClient.loadExperimentAssignment
		> ).mockImplementationOnce( () => controllablePromise1.promise );

		const { result, rerender, waitForNextUpdate } = renderHook( () =>
			useExperiment( 'experiment_a' )
		);

		expect( result.current ).toEqual( [ true, null ] );
		actReactHooks( () => controllablePromise1.resolve( validExperimentAssignment ) );
		expect( result.current ).toEqual( [ true, null ] );
		await waitForNextUpdate();
		expect( result.current ).toEqual( [ false, validExperimentAssignment ] );
		rerender();
		expect( result.current ).toEqual( [ false, validExperimentAssignment ] );
	} );
} );

describe( 'Experiment', () => {
	it( 'should correctly show treatment after loading', async () => {
		const exPlatClient = createMockExPlatClient();
		const { Experiment } = createExPlatClientReactHelpers( exPlatClient );

		const controllablePromise1 = createControllablePromise< ExperimentAssignment >();
		( exPlatClient.loadExperimentAssignment as jest.MockedFunction<
			typeof exPlatClient.loadExperimentAssignment
		> ).mockImplementationOnce( () => controllablePromise1.promise );

		const { container, rerender } = render(
			<Experiment name="experiment_a">
				{ {
					treatment: 'treatment-1',
					default: 'default',
					loading: 'loading-1',
				} }
			</Experiment>
		);
		expect( container.textContent ).toBe( 'loading-1' );
		rerender(
			<Experiment name="experiment_a">
				{ {
					treatment: 'treatment-1',
					default: 'default',
					loading: 'loading-2',
				} }
			</Experiment>
		);
		expect( container.textContent ).toBe( 'loading-2' );
		await actReact( async () => controllablePromise1.resolve( validExperimentAssignment ) );
		await waitFor( () => expect( container.textContent ).toBe( 'treatment-1' ) );
		rerender(
			<Experiment name="experiment_a">
				{ {
					treatment: 'treatment-2',
					default: 'default',
					loading: 'loading-2',
				} }
			</Experiment>
		);
		expect( container.textContent ).toBe( 'treatment-2' );
	} );

	it( 'should correctly show default after loading ', async () => {
		const exPlatClient = createMockExPlatClient();
		const { Experiment } = createExPlatClientReactHelpers( exPlatClient );

		const controllablePromise1 = createControllablePromise< ExperimentAssignment >();
		( exPlatClient.loadExperimentAssignment as jest.MockedFunction<
			typeof exPlatClient.loadExperimentAssignment
		> ).mockImplementationOnce( () => controllablePromise1.promise );

		const { container, rerender } = render(
			<Experiment name="experiment_a">
				{ {
					treatment: 'treatment',
					default: 'default-1',
					loading: 'loading',
				} }
			</Experiment>
		);
		expect( container.textContent ).toBe( 'loading' );
		await actReact( async () =>
			controllablePromise1.resolve( { ...validExperimentAssignment, variationName: null } )
		);
		await waitFor( () => expect( container.textContent ).toBe( 'default-1' ) );
		rerender(
			<Experiment name="experiment_a">
				{ {
					treatment: 'treatment-2',
					default: 'default-2',
					loading: 'loading-2',
				} }
			</Experiment>
		);
		expect( container.textContent ).toBe( 'default-2' );
	} );
} );
