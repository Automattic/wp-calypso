const debounce = require( '../../app/lib/debounce' );

describe( 'debounce', () => {
	beforeEach( () => {
		jest.useFakeTimers();
	} );

	afterEach( () => {
		jest.useRealTimers();
	} );

	describe( 'trailing (default)', () => {
		it( 'invokes once, after the wait, with the latest arguments', () => {
			const fn = jest.fn();
			const debounced = debounce( fn, 1000 );

			debounced( 'a' );
			debounced( 'b' );
			debounced( 'c' );
			expect( fn ).not.toHaveBeenCalled();

			jest.advanceTimersByTime( 999 );
			expect( fn ).not.toHaveBeenCalled();

			jest.advanceTimersByTime( 1 );
			expect( fn ).toHaveBeenCalledTimes( 1 );
			expect( fn ).toHaveBeenCalledWith( 'c' );
		} );

		it( 'restarts the timer on each call', () => {
			const fn = jest.fn();
			const debounced = debounce( fn, 1000 );

			debounced();
			jest.advanceTimersByTime( 800 );
			debounced();
			jest.advanceTimersByTime( 800 );
			expect( fn ).not.toHaveBeenCalled();

			jest.advanceTimersByTime( 200 );
			expect( fn ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'forwards `this` and the latest arguments', () => {
			const fn = jest.fn();
			const debounced = debounce( fn, 1000 );
			const context = { id: 42 };

			debounced.call( context, 'first' );
			debounced.call( context, 'second' );
			jest.advanceTimersByTime( 1000 );

			expect( fn ).toHaveBeenCalledTimes( 1 );
			expect( fn.mock.contexts[ 0 ] ).toBe( context );
			expect( fn.mock.calls[ 0 ] ).toEqual( [ 'second' ] );
		} );
	} );

	describe( 'leading only', () => {
		const options = { leading: true, trailing: false };

		it( 'invokes immediately on the first call and suppresses the rest of the burst', () => {
			const fn = jest.fn();
			const debounced = debounce( fn, 100, options );

			debounced( 1 );
			expect( fn ).toHaveBeenCalledTimes( 1 );
			expect( fn ).toHaveBeenCalledWith( 1 );

			debounced( 2 );
			debounced( 3 );
			jest.advanceTimersByTime( 100 );

			// No trailing invoke for the suppressed calls.
			expect( fn ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'fires a fresh leading edge after the burst settles', () => {
			const fn = jest.fn();
			const debounced = debounce( fn, 100, options );

			debounced( 'first' );
			debounced( 'suppressed' );
			jest.advanceTimersByTime( 100 );
			expect( fn ).toHaveBeenCalledTimes( 1 );

			debounced( 'second' );
			expect( fn ).toHaveBeenCalledTimes( 2 );
			expect( fn ).toHaveBeenLastCalledWith( 'second' );
		} );
	} );

	describe( 'leading and trailing', () => {
		const options = { leading: true, trailing: true };

		it( 'invokes only on the leading edge for a single call', () => {
			const fn = jest.fn();
			const debounced = debounce( fn, 100, options );

			debounced( 'solo' );
			expect( fn ).toHaveBeenCalledTimes( 1 );

			jest.advanceTimersByTime( 100 );
			expect( fn ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'invokes on both edges for a burst, trailing with the latest arguments', () => {
			const fn = jest.fn();
			const debounced = debounce( fn, 100, options );

			debounced( 'a' );
			debounced( 'b' );
			debounced( 'c' );
			expect( fn ).toHaveBeenCalledTimes( 1 );
			expect( fn ).toHaveBeenCalledWith( 'a' );

			jest.advanceTimersByTime( 100 );
			expect( fn ).toHaveBeenCalledTimes( 2 );
			expect( fn ).toHaveBeenLastCalledWith( 'c' );
		} );
	} );
} );
