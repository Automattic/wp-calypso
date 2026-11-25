/**
 * @vitest-environment jsdom
 */
import { SiteDetails } from '@automattic/data-stores';
import { renderHook, act, fireEvent, render, screen } from '@testing-library/react';
import { createElement, lazy, Suspense, useState, type ChangeEvent } from 'react';
import { type Mock, vi } from 'vitest';
import { useSelector } from 'calypso/state';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { lazyCache, tryPreload, usePreloadSteps } from '../../use-preload-steps';
import type { Flow, StepperStep } from '../../../types';

// Mock dependencies
vi.mock( 'calypso/state', () => ( {
	useSelector: vi.fn(),
} ) );

vi.mock( 'calypso/state/current-user/selectors', () => ( {
	isUserLoggedIn: vi.fn(),
} ) );

vi.mock( 'debug', () => ( { default: () => vi.fn() } ) );

const PRELOAD_DELAY_MS = 5000;

describe( 'tryPreload', () => {
	it( 'caches a component when the renderer has not cached it yet', async () => {
		const Component = () => null;
		const step = {
			slug: 'error',
			asyncComponent: async () => ( { default: Component } ),
		} satisfies StepperStep;

		await tryPreload( step );

		expect( lazyCache.get( step.asyncComponent ) ).toBe( Component );
	} );

	it( 'preserves an edited address after preloading and rerendering', async () => {
		const initialValue = 'https://wordpress.org/';
		function Address() {
			const [ value, setValue ] = useState( initialValue );
			return createElement( 'input', {
				'aria-label': 'Site address',
				value,
				onChange: ( event: ChangeEvent< HTMLInputElement > ) => setValue( event.target.value ),
			} );
		}
		const step = {
			slug: 'error',
			asyncComponent: async () => ( { default: Address } ),
		} satisfies StepperStep;
		const preloading = tryPreload( step );
		const LazyStep = lazy( step.asyncComponent );
		lazyCache.set( step.asyncComponent, LazyStep );
		const { rerender } = render(
			createElement( Suspense, { fallback: null }, createElement( LazyStep ) )
		);
		await act( async () => {
			await preloading;
		} );

		expect( screen.getByRole( 'textbox' ) ).toHaveValue( initialValue );
		fireEvent.change( screen.getByRole( 'textbox' ), { target: { value: 'cotrim.dev' } } );
		const CachedStep = lazyCache.get( step.asyncComponent ) as typeof LazyStep;
		rerender( createElement( Suspense, { fallback: null }, createElement( CachedStep ) ) );

		expect( screen.getByRole( 'textbox' ) ).toHaveValue( 'cotrim.dev' );
	} );
} );

describe( 'usePreloadSteps', () => {
	// Mock step components
	const mockAsyncComponent1 = vi.fn().mockResolvedValue( { default: null } );
	const mockAsyncComponent2 = vi.fn().mockResolvedValue( { default: null } );
	const mockAsyncComponent3 = vi.fn().mockResolvedValue( { default: null } );
	const mockUserAsyncComponent = vi.fn().mockResolvedValue( { default: null } );

	// Mock flow steps
	const mockFlowSteps = [
		{ slug: 'step1', asyncComponent: mockAsyncComponent1 },
		{ slug: 'step2', asyncComponent: mockAsyncComponent2, requiresLoggedInUser: true },
		{ slug: 'step3', asyncComponent: mockAsyncComponent3 },
		{ slug: 'user', asyncComponent: mockUserAsyncComponent },
	] as StepperStep[];

	// Mock flow
	const mockFlow = { name: 'test-flow' } as Flow;

	// Add this mock site details object
	const mockSiteDetails = {
		ID: 123,
	} as SiteDetails;

	beforeEach( () => {
		vi.clearAllMocks();
		vi.useFakeTimers();
		( useSelector as Mock ).mockImplementation( ( selector ) => {
			if ( selector === isUserLoggedIn ) {
				return false;
			}
			return null;
		} );
	} );

	afterEach( () => {
		vi.useRealTimers();
	} );

	it( 'should not preload anything if siteSlugOrId is provided but selectedSite is not', async () => {
		renderHook( () => usePreloadSteps( 'site-slug', null, 'step1', mockFlowSteps, mockFlow ) );

		await act( () => vi.advanceTimersByTime( PRELOAD_DELAY_MS ) );

		expect( mockAsyncComponent1 ).not.toHaveBeenCalled();
		expect( mockAsyncComponent2 ).not.toHaveBeenCalled();
		expect( mockAsyncComponent3 ).not.toHaveBeenCalled();
	} );

	it( 'should not preload before the delay elapses', () => {
		renderHook( () =>
			usePreloadSteps( 'site-slug', mockSiteDetails, 'step1', mockFlowSteps, mockFlow )
		);

		vi.advanceTimersByTime( PRELOAD_DELAY_MS - 1 );

		expect( mockAsyncComponent2 ).not.toHaveBeenCalled();
		expect( mockAsyncComponent3 ).not.toHaveBeenCalled();
	} );

	it( 'should preload the next step and the step after that', async () => {
		renderHook( () =>
			usePreloadSteps( 'site-slug', mockSiteDetails, 'step1', mockFlowSteps, mockFlow )
		);

		await act( () => vi.advanceTimersByTime( PRELOAD_DELAY_MS ) );

		expect( mockAsyncComponent2 ).toHaveBeenCalled();
		expect( mockAsyncComponent3 ).toHaveBeenCalled();
	} );

	it( 'should preload the user step if any step requires authentication and user is not logged in', async () => {
		renderHook( () =>
			usePreloadSteps( 'site-slug', mockSiteDetails, 'step1', mockFlowSteps, mockFlow )
		);

		await act( () => vi.advanceTimersByTime( PRELOAD_DELAY_MS ) );

		expect( mockUserAsyncComponent ).toHaveBeenCalled();
	} );

	it( 'should not preload the user step if user is already logged in', async () => {
		( useSelector as Mock ).mockImplementation( ( selector ) => {
			if ( selector === isUserLoggedIn ) {
				return true;
			}
			return null;
		} );

		renderHook( () =>
			usePreloadSteps( 'site-slug', mockSiteDetails, 'step1', mockFlowSteps, mockFlow )
		);

		await act( () => vi.advanceTimersByTime( PRELOAD_DELAY_MS ) );

		expect( mockUserAsyncComponent ).not.toHaveBeenCalled();
	} );

	it( 'should preload the first step requiring authentication when current step is user', async () => {
		renderHook( () =>
			usePreloadSteps( 'site-slug', mockSiteDetails, 'user', mockFlowSteps, mockFlow )
		);

		await act( () => vi.advanceTimersByTime( PRELOAD_DELAY_MS ) );

		expect( mockAsyncComponent2 ).toHaveBeenCalled(); // First step requiring authentication
		expect( mockAsyncComponent3 ).toHaveBeenCalled(); // Next step after that
	} );

	it( 'should not preload anything if current step is not found in flow steps', async () => {
		renderHook( () =>
			usePreloadSteps( 'site-slug', mockSiteDetails, 'non-existent-step', mockFlowSteps, mockFlow )
		);

		await act( () => vi.advanceTimersByTime( PRELOAD_DELAY_MS ) );

		expect( mockAsyncComponent1 ).not.toHaveBeenCalled();
		expect( mockAsyncComponent2 ).not.toHaveBeenCalled();
		expect( mockAsyncComponent3 ).not.toHaveBeenCalled();
	} );

	it( 'should handle the case when there are no more steps to preload', async () => {
		renderHook( () =>
			usePreloadSteps( 'site-slug', mockSiteDetails, 'step3', mockFlowSteps, mockFlow )
		);

		await act( () => vi.advanceTimersByTime( PRELOAD_DELAY_MS ) );

		// No error should be thrown
		expect( mockAsyncComponent1 ).not.toHaveBeenCalled();
		expect( mockAsyncComponent2 ).not.toHaveBeenCalled();
		expect( mockAsyncComponent3 ).not.toHaveBeenCalled(); // Current step, not preloaded
	} );

	it( 'should cancel preloading on unmount', async () => {
		const { unmount } = renderHook( () =>
			usePreloadSteps( 'site-slug', mockSiteDetails, 'step1', mockFlowSteps, mockFlow )
		);

		unmount();
		await act( () => vi.advanceTimersByTime( PRELOAD_DELAY_MS ) );

		expect( mockAsyncComponent2 ).not.toHaveBeenCalled();
		expect( mockAsyncComponent3 ).not.toHaveBeenCalled();
	} );
} );
