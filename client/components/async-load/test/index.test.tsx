/**
 * @jest-environment jsdom
 */
import { render, screen, waitForElementToBeRemoved } from '@testing-library/react';
import { Component, type ReactNode } from 'react';
import { bumpStat } from 'calypso/lib/analytics/mc';
import { logToLogstash } from 'calypso/lib/logstash';
import AsyncLoad from '../index';

jest.mock( 'calypso/lib/analytics/mc', () => ( { bumpStat: jest.fn() } ) );
jest.mock( 'calypso/lib/logstash', () => ( {
	logToLogstash: jest.fn( () => Promise.resolve() ),
} ) );

const Loaded = () => <div>loaded</div>;
const Boom = () => {
	throw new Error( 'runtime boom' );
};

const requireLoaded = () => Promise.resolve( { default: Loaded } );
const requireBoom = () => Promise.resolve( { default: Boom } );
const CHUNK_URL =
	'https://example.com/calypso/evergreen/async-load-calypso-blocks-privacy-prefs.abc123.min.js?v=1';
const chunkLoadError = ( request?: string ) =>
	Object.assign( new Error( 'chunk blocked' ), { name: 'ChunkLoadError', request } );
const requireReject = () => Promise.reject( chunkLoadError( CHUNK_URL ) );
const requireOtherReject = () =>
	Promise.reject(
		chunkLoadError( 'https://example.com/calypso/evergreen/async-load-other.abc123.min.js' )
	);
const requireLogstashReject = () =>
	Promise.reject(
		chunkLoadError( 'https://example.com/calypso/evergreen/async-load-logstash.abc123.min.js' )
	);
const requireEvalError = () => Promise.reject( new TypeError( 'module eval boom' ) );
const requireThrowSync = (): Promise< never > => {
	throw chunkLoadError();
};

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
		jest.mocked( bumpStat ).mockClear();
		jest.mocked( logToLogstash ).mockClear();
	} );

	test( 'renders the loaded component on success', async () => {
		render( <AsyncLoad require={ requireLoaded } placeholder={ null } /> );

		expect( await screen.findByText( 'loaded' ) ).toBeVisible();
		expect( bumpStat ).not.toHaveBeenCalled();
		expect( logToLogstash ).not.toHaveBeenCalled();
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
		expect( bumpStat ).toHaveBeenCalledWith(
			'calypso_chunk_error',
			'async-load-calypso-blocks-privacy-prefs'
		);
		expect( logToLogstash ).toHaveBeenCalledWith(
			expect.objectContaining( {
				feature: 'calypso_client',
				properties: expect.objectContaining( {
					type: 'calypso_chunk_error',
					chunk: 'async-load-calypso-blocks-privacy-prefs',
				} ),
			} )
		);
	} );

	test( 'logs each failed chunk to logstash once per page session', async () => {
		const { unmount } = render(
			<AsyncLoad
				require={ requireOtherReject }
				placeholder={ null }
				loadFailureFallback={ <div>fallback</div> }
			/>
		);
		expect( await screen.findByText( 'fallback' ) ).toBeVisible();
		unmount();

		render(
			<AsyncLoad
				require={ requireOtherReject }
				placeholder={ null }
				loadFailureFallback={ <div>fallback again</div> }
			/>
		);
		expect( await screen.findByText( 'fallback again' ) ).toBeVisible();

		expect( bumpStat ).toHaveBeenCalledTimes( 2 );
		expect( logToLogstash ).toHaveBeenCalledTimes( 1 );
	} );

	test( 'renders loadFailureFallback when logstash rejects', async () => {
		jest.mocked( logToLogstash ).mockRejectedValueOnce( new Error( 'logstash blocked' ) );

		render(
			<AsyncLoad
				require={ requireLogstashReject }
				placeholder={ null }
				loadFailureFallback={ <div>fallback</div> }
			/>
		);

		expect( await screen.findByText( 'fallback' ) ).toBeVisible();
		expect( logToLogstash ).toHaveBeenCalledTimes( 1 );
	} );

	test( 'renders loadFailureFallback when require throws synchronously', async () => {
		render(
			<AsyncLoad
				require={ requireThrowSync }
				placeholder={ null }
				loadFailureFallback={ <div>fallback</div> }
			/>
		);

		expect( await screen.findByText( 'fallback' ) ).toBeVisible();
		expect( bumpStat ).toHaveBeenCalledWith( 'calypso_chunk_error', 'async-load' );
	} );

	test( 'propagates non-chunk import errors even when a fallback is provided', async () => {
		render(
			<CatchBoundary>
				<AsyncLoad
					require={ requireEvalError }
					placeholder={ null }
					loadFailureFallback={ <div>fallback</div> }
				/>
			</CatchBoundary>
		);

		expect( await screen.findByText( 'boundary: module eval boom' ) ).toBeVisible();
		expect( screen.queryByText( 'fallback' ) ).not.toBeInTheDocument();
		expect( bumpStat ).not.toHaveBeenCalled();
		expect( logToLogstash ).not.toHaveBeenCalled();
	} );

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
		expect( bumpStat ).toHaveBeenCalledTimes( 1 );
		expect( bumpStat ).toHaveBeenCalledWith(
			'calypso_chunk_error',
			'async-load-calypso-blocks-privacy-prefs'
		);
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
