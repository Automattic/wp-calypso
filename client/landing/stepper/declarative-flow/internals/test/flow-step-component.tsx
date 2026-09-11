/**
 * @jest-environment jsdom
 */
import { act, render, screen } from '@testing-library/react';
import { Suspense, useEffect, useState } from 'react';
import { tryPreload } from '../hooks/use-preload-steps';
import { flowStepComponent } from '../index';
import type { StepperStep } from '../types';

jest.mock( 'debug', () => () => jest.fn() );

let mounts = 0;

const StepBody = () => {
	useEffect( () => {
		mounts += 1;
	}, [] );
	return <p>step body</p>;
};

// What FlowRenderer does on every render: resolve the step's component through the cache and
// render whatever comes back.
const Renderer = ( { step }: { step: StepperStep } ) => {
	const StepComponent = flowStepComponent( step )!;
	return (
		<Suspense fallback={ null }>
			<StepComponent />
		</Suspense>
	);
};

let rerenderParent: () => void = () => {};

const Harness = ( { step }: { step: StepperStep } ) => {
	const [ , setTick ] = useState( 0 );
	rerenderParent = () => setTick( ( tick ) => tick + 1 );
	return <Renderer step={ step } />;
};

describe( 'flowStepComponent', () => {
	beforeEach( () => {
		mounts = 0;
	} );

	// Control for the harness: with no preload in flight the lazy wrapper is the only entry, so a
	// parent re-render must not remount the step.
	it( 'mounts a step once across a parent re-render when nothing preloads it', async () => {
		const step = {
			slug: 'processing',
			asyncComponent: () => Promise.resolve( { default: StepBody } ),
		} as unknown as StepperStep;

		render( <Harness step={ step } /> );
		await screen.findByText( 'step body' );

		await act( () => {
			rerenderParent();
		} );

		expect( mounts ).toBe( 1 );
	} );

	// The onboarding flow first preloads `processing` when `create-site` mounts, and `create-site`
	// submits in the same effect pass. So the preload's import is in flight when the navigation
	// renders `processing`, the cache misses, and a `lazy()` wrapper is handed to React. The preload
	// then resolves and stores the raw component under the same key. The next FlowRenderer render
	// gets a different component type back and React remounts the step, which runs its pending
	// action a second time.
	it( 'hands React the same component before and after a preload that resolves mid-render', async () => {
		const step = {
			slug: 'processing',
			asyncComponent: () => Promise.resolve( { default: StepBody } ),
		} as unknown as StepperStep;

		const preload = tryPreload( step );
		render( <Harness step={ step } /> );
		await screen.findByText( 'step body' );
		await act( () => preload );

		await act( () => {
			rerenderParent();
		} );

		expect( mounts ).toBe( 1 );
	} );
} );
