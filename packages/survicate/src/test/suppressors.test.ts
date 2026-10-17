/**
 * @jest-environment jsdom
 */

import {
	getActiveSuppressorReason,
	observeSuppressors,
	registerSurveySuppressor,
	type SurveySuppressor,
} from '../suppressors';

function createSuppressor( initiallyActive = false ) {
	let active = initiallyActive;
	const listeners = new Set< () => void >();
	const suppressor: SurveySuppressor = {
		reason: 'notifications',
		isActive: () => active,
		subscribe: ( onChange ) => {
			listeners.add( onChange );
			return () => listeners.delete( onChange );
		},
	};
	return {
		suppressor,
		listenerCount: () => listeners.size,
		set( value: boolean ) {
			active = value;
			listeners.forEach( ( fn ) => fn() );
		},
	};
}

describe( 'survey suppressors', () => {
	const cleanups: Array< () => void > = [];
	const track = ( cleanup: () => void ) => {
		cleanups.push( cleanup );
		return cleanup;
	};

	afterEach( () => {
		cleanups.splice( 0 ).forEach( ( cleanup ) => cleanup() );
	} );

	describe( 'getActiveSuppressorReason', () => {
		it( 'returns null when nothing is registered', () => {
			expect( getActiveSuppressorReason() ).toBeNull();
		} );

		it( 'returns the reason of an active suppressor', () => {
			const notes = createSuppressor( true );
			track( registerSurveySuppressor( notes.suppressor ) );

			expect( getActiveSuppressorReason() ).toBe( 'notifications' );
		} );

		it( 'ignores inactive and unregistered suppressors', () => {
			const notes = createSuppressor( false );
			const unregister = registerSurveySuppressor( notes.suppressor );

			expect( getActiveSuppressorReason() ).toBeNull();

			notes.set( true );
			unregister();

			expect( getActiveSuppressorReason() ).toBeNull();
		} );

		it( 'fails open when a suppressor throws', () => {
			track(
				registerSurveySuppressor( {
					reason: 'notifications',
					isActive: () => {
						throw new Error( 'boom' );
					},
					subscribe: () => () => {},
				} )
			);

			expect( getActiveSuppressorReason() ).toBeNull();
		} );
	} );

	describe( 'observeSuppressors', () => {
		it( 'reports activation and deactivation transitions only', () => {
			const notes = createSuppressor( false );
			track( registerSurveySuppressor( notes.suppressor ) );
			const onActivate = jest.fn();
			const onDeactivate = jest.fn();
			track( observeSuppressors( onActivate, onDeactivate ) );

			notes.set( false );
			expect( onActivate ).not.toHaveBeenCalled();

			notes.set( true );
			notes.set( true );
			expect( onActivate ).toHaveBeenCalledTimes( 1 );
			expect( onActivate ).toHaveBeenCalledWith( 'notifications' );

			notes.set( false );
			expect( onDeactivate ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'observes suppressors registered after it started', () => {
			const onActivate = jest.fn();
			track( observeSuppressors( onActivate, jest.fn() ) );
			const notes = createSuppressor( false );
			track( registerSurveySuppressor( notes.suppressor ) );

			notes.set( true );

			expect( onActivate ).toHaveBeenCalledWith( 'notifications' );
		} );

		it( 'unsubscribes from every suppressor when stopped', () => {
			const notes = createSuppressor( false );
			track( registerSurveySuppressor( notes.suppressor ) );
			const onActivate = jest.fn();
			const stop = observeSuppressors( onActivate, jest.fn() );
			expect( notes.listenerCount() ).toBe( 1 );

			stop();
			notes.set( true );

			expect( notes.listenerCount() ).toBe( 0 );
			expect( onActivate ).not.toHaveBeenCalled();
		} );

		it( 'stops observing a suppressor once it is unregistered', () => {
			const notes = createSuppressor( false );
			const unregister = registerSurveySuppressor( notes.suppressor );
			track( observeSuppressors( jest.fn(), jest.fn() ) );

			unregister();

			expect( notes.listenerCount() ).toBe( 0 );
		} );
	} );
} );
