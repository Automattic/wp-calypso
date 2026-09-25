/**
 * @jest-environment jsdom
 */
import { render, screen, waitForElementToBeRemoved } from '@testing-library/react';
import { Component, type ReactNode } from 'react';
import AsyncLoad from '../index';

const Loaded = () => <div>loaded</div>;
const Boom = () => {
	throw new Error( 'runtime boom' );
};

const requireLoaded = () => Promise.resolve( { default: Loaded } );
const requireBoom = () => Promise.resolve( { default: Boom } );
const requireReject = () => Promise.reject( new Error( 'chunk blocked' ) );

class CatchBoundary extends Component< { children: ReactNode }, { error: Error | null } > {
	state = { error: null as Error | null };
	static getDerivedStateFromError( error: Error ) {
		return { error };
	}
	render() {
		if ( this.state.error ) {
			return <div>boundary: { this.state.error.message }</div>;
		}
		return this.props.children;
	}
}

describe( 'AsyncLoad', () => {
	let consoleError: jest.SpyInstance;

	beforeEach( () => {
		// Silence React's logging of caught render errors.
		consoleError = jest.spyOn( console, 'error' ).mockImplementation( () => {} );
	} );

	afterEach( () => {
		consoleError.mockRestore();
	} );

	test( 'renders the loaded component on success', async () => {
		render( <AsyncLoad require={ requireLoaded } placeholder={ null } /> );

		expect( await screen.findByText( 'loaded' ) ).toBeVisible();
	} );

	test( 'renders loadFailureFallback when the import rejects', async () => {
		render(
			<AsyncLoad
				require={ requireReject }
				placeholder={ null }
				loadFailureFallback={ <div>fallback</div> }
			/>
		);

		expect( await screen.findByText( 'fallback' ) ).toBeVisible();
	} );

	/* `null` is what the shipped callers pass, and it must stay distinct from an omitted
	   prop: a falsy check here would let the rejection escape and blank the whole app. */
	test( 'renders nothing and swallows the rejection when loadFailureFallback is null', async () => {
		render(
			<CatchBoundary>
				<AsyncLoad
					require={ requireReject }
					placeholder={ <div>placeholder</div> }
					loadFailureFallback={ null }
				/>
			</CatchBoundary>
		);

		await waitForElementToBeRemoved( () => screen.queryByText( 'placeholder' ) );

		expect( screen.queryByText( /^boundary:/ ) ).not.toBeInTheDocument();
	} );

	test( 'propagates the import rejection when no fallback is provided', async () => {
		render(
			<CatchBoundary>
				<AsyncLoad require={ requireReject } placeholder={ null } />
			</CatchBoundary>
		);

		expect( await screen.findByText( 'boundary: chunk blocked' ) ).toBeVisible();
	} );

	test( 'does not swallow runtime errors thrown inside the loaded component', async () => {
		render(
			<CatchBoundary>
				<AsyncLoad
					require={ requireBoom }
					placeholder={ null }
					loadFailureFallback={ <div>fallback</div> }
				/>
			</CatchBoundary>
		);

		expect( await screen.findByText( 'boundary: runtime boom' ) ).toBeVisible();
		expect( screen.queryByText( 'fallback' ) ).not.toBeInTheDocument();
	} );
} );
