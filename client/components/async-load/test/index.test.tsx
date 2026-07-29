/**
 * @jest-environment jsdom
 */
import { render, screen, waitFor } from '@testing-library/react';
import { Component, type ReactNode } from 'react';
import AsyncLoad from '../index';

const Loaded = () => <div>loaded</div>;
const Boom = () => {
	throw new Error( 'runtime boom' );
};

const importError = new Error( 'chunk blocked' );
const requireLoaded = () => Promise.resolve( { default: Loaded } );
const requireBoom = () => Promise.resolve( { default: Boom } );
const requireRejectTracked = () => Promise.reject( importError );
const requireReject = () => Promise.reject( new Error( 'no fallback' ) );

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

	test( 'renders loadFailureFallback and calls onLoadFailure when the import rejects', async () => {
		const onLoadFailure = jest.fn();

		render(
			<AsyncLoad
				require={ requireRejectTracked }
				placeholder={ null }
				loadFailureFallback={ <div>fallback</div> }
				onLoadFailure={ onLoadFailure }
			/>
		);

		expect( await screen.findByText( 'fallback' ) ).toBeVisible();
		await waitFor( () => expect( onLoadFailure ).toHaveBeenCalledWith( importError ) );
	} );

	test( 'propagates the import rejection when no fallback is provided', async () => {
		render(
			<CatchBoundary>
				<AsyncLoad require={ requireReject } placeholder={ null } />
			</CatchBoundary>
		);

		expect( await screen.findByText( 'boundary: no fallback' ) ).toBeVisible();
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
