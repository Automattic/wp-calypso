/**
 * @jest-environment jsdom
 */

import { act, render, renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import createExPlatClientReactHelpers from '../index';
import type { ExPlatClient, ExperimentAssignment } from '@automattic/explat-client';

const validExperimentAssignment = {
	experimentName: 'experiment_name_a',
	variationName: 'treatment',
	retrievedTimestamp: Date.now(),
	ttl: 60,
};

const createMockExPlatClient = ( isDevelopmentMode = false ): ExPlatClient => ( {
	loadExperimentAssignment: jest.fn(),
	dangerouslyGetExperimentAssignment: jest.fn(),
	dangerouslyGetMaybeLoadedExperimentAssignment: jest.fn( () => null ),
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
		resolve: resOuter as unknown as ( T ) => void,
		reject: rejOuter as unknown as ( ...x: unknown[] ) => void,
		promise,
	};
};

describe( 'useExperiment', () => {
	it( 'should correctly load an experiment assignment', async () => {
		const exPlatClient = createMockExPlatClient();
		const { useExperiment } = createExPlatClientReactHelpers( exPlatClient );

		const controllablePromise1 = createControllablePromise< ExperimentAssignment >();
		jest
			.mocked( exPlatClient.loadExperimentAssignment )
			.mockReturnValueOnce( controllablePromise1.promise );

		const { result, rerender } = renderHook( () => useExperiment( 'experiment_a' ) );

		expect( result.current ).toEqual( [ true, null ] );
		expect( exPlatClient.loadExperimentAssignment ).toHaveBeenCalledTimes( 1 );
		act( () => controllablePromise1.resolve( validExperimentAssignment ) );
		jest
			.mocked( exPlatClient.dangerouslyGetMaybeLoadedExperimentAssignment )
			.mockReturnValue( validExperimentAssignment );
		await waitFor( () => expect( result.current ).toEqual( [ true, null ] ) );
		rerender();
		expect( result.current ).toEqual( [ false, validExperimentAssignment ] );
		rerender();
		expect( result.current ).toEqual( [ false, validExperimentAssignment ] );
	} );

	it( 'should correctly load an experiment assignment respecting eligibility', async () => {
		const exPlatClient = createMockExPlatClient();
		const { useExperiment } = createExPlatClientReactHelpers( exPlatClient );

		const controllablePromise1 = createControllablePromise< ExperimentAssignment >();
		jest
			.mocked( exPlatClient.loadExperimentAssignment )
			.mockReturnValueOnce( controllablePromise1.promise );

		let isEligible = false;
		const { result, rerender } = renderHook( () =>
			useExperiment( 'experiment_a', { isEligible } )
		);

		expect( result.current ).toEqual( [ false, null ] );
		expect( exPlatClient.loadExperimentAssignment ).toHaveBeenCalledTimes( 0 );

		isEligible = true;
		rerender();
		expect( result.current ).toEqual( [ true, null ] );
		expect( exPlatClient.loadExperimentAssignment ).toHaveBeenCalledTimes( 1 );
		jest
			.mocked( exPlatClient.dangerouslyGetMaybeLoadedExperimentAssignment )
			.mockReturnValue( validExperimentAssignment );
		act( () => controllablePromise1.resolve( validExperimentAssignment ) );
		await waitFor( () => expect( result.current ).toEqual( [ true, null ] ) );
		rerender();
		expect( result.current ).toEqual( [ false, validExperimentAssignment ] );
		rerender();
		expect( result.current ).toEqual( [ false, validExperimentAssignment ] );

		isEligible = false;
		rerender();
		expect( result.current ).toEqual( [ false, null ] );
		expect( exPlatClient.loadExperimentAssignment ).toHaveBeenCalledTimes( 1 );
	} );
} );

describe( 'Experiment', () => {
	it( 'should correctly show treatment after loading', async () => {
		const exPlatClient = createMockExPlatClient();
		const { Experiment } = createExPlatClientReactHelpers( exPlatClient );

		const controllablePromise1 = createControllablePromise< ExperimentAssignment >();
		jest
			.mocked( exPlatClient.loadExperimentAssignment )
			.mockReturnValueOnce( controllablePromise1.promise );

		const { container, rerender } = render(
			<Experiment
				name="experiment_a"
				treatmentExperience="treatment-1"
				defaultExperience="default"
				loadingExperience="loading-1"
			/>
		);
		expect( container.textContent ).toBe( 'loading-1' );
		rerender(
			<Experiment
				name="experiment_a"
				treatmentExperience="treatment-1"
				defaultExperience="default"
				loadingExperience="loading-2"
			/>
		);
		expect( container.textContent ).toBe( 'loading-2' );
		jest
			.mocked( exPlatClient.dangerouslyGetMaybeLoadedExperimentAssignment )
			.mockReturnValue( validExperimentAssignment );
		await act( async () => controllablePromise1.resolve( validExperimentAssignment ) );
		await waitFor( () => expect( container.textContent ).toBe( 'treatment-1' ) );
		rerender(
			<Experiment
				name="experiment_a"
				treatmentExperience="treatment-2"
				defaultExperience="default"
				loadingExperience="loading-2"
			/>
		);
		expect( container.textContent ).toBe( 'treatment-2' );
	} );

	it( 'should correctly show default after loading', async () => {
		const exPlatClient = createMockExPlatClient();
		const { Experiment } = createExPlatClientReactHelpers( exPlatClient );

		const controllablePromise1 = createControllablePromise< ExperimentAssignment >();
		jest
			.mocked( exPlatClient.loadExperimentAssignment )
			.mockReturnValueOnce( controllablePromise1.promise );

		const { container, rerender } = render(
			<Experiment
				name="experiment_a"
				treatmentExperience="treatment"
				defaultExperience="default-1"
				loadingExperience="loading"
			/>
		);
		expect( container.textContent ).toBe( 'loading' );
		const resolvedExperimentAssignment = { ...validExperimentAssignment, variationName: null };
		jest
			.mocked( exPlatClient.dangerouslyGetMaybeLoadedExperimentAssignment )
			.mockReturnValue( resolvedExperimentAssignment );
		await act( async () => controllablePromise1.resolve( resolvedExperimentAssignment ) );
		await waitFor( () => expect( container.textContent ).toBe( 'default-1' ) );
		rerender(
			<Experiment
				name="experiment_a"
				treatmentExperience="treatment-2"
				defaultExperience="default-2"
				loadingExperience="loading-2"
			/>
		);
		expect( container.textContent ).toBe( 'default-2' );
	} );
} );

describe( 'ProvideExperimentData', () => {
	it( 'should correctly provide data', async () => {
		const exPlatClient = createMockExPlatClient();
		const { ProvideExperimentData } = createExPlatClientReactHelpers( exPlatClient );

		const controllablePromise1 = createControllablePromise< ExperimentAssignment >();
		jest
			.mocked( exPlatClient.loadExperimentAssignment )
			.mockReturnValueOnce( controllablePromise1.promise );

		const capture = jest.fn();
		render(
			<ProvideExperimentData name="experiment_a">
				{ ( isLoading, experimentAssignment ) => (
					<>{ capture( isLoading, experimentAssignment ) }</>
				) }
			</ProvideExperimentData>
		);
		expect( capture ).toHaveBeenCalledTimes( 1 );
		expect( capture.mock.calls[ 0 ] ).toEqual( [ true, null ] );
		capture.mockReset();
		const experimentAssignment = { ...validExperimentAssignment, variationName: null };
		jest
			.mocked( exPlatClient.dangerouslyGetMaybeLoadedExperimentAssignment )
			.mockReturnValue( experimentAssignment );
		await act( async () => controllablePromise1.resolve( experimentAssignment ) );
		await waitFor( () => {
			expect( capture ).toHaveBeenCalledTimes( 1 );
		} );
		expect( capture.mock.calls[ 0 ] ).toEqual( [ false, experimentAssignment ] );
	} );
} );
