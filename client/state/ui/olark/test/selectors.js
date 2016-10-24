/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	isOlarkReady,
	isOlarkTimedOut,
	isRequestingOlark
} from '../selectors';
import {
	STATUS_READY,
	STATUS_TIMEOUT
} from '../constants';

describe( 'selectors', () => {
	describe( '#isOlarkReady()', () => {
		it( 'should return false if olark has unknown status', () => {
			const isReady = isOlarkReady( {
				ui: {
					olark: {
						status: null
					}
				}
			} );
			expect( isReady ).to.equal( false );
		} );
		it( 'should return false if olark is timed out', () => {
			const isReady = isOlarkReady( {
				ui: {
					olark: {
						status: STATUS_TIMEOUT
					}
				}
			} );
			expect( isReady ).to.equal( false );
		} );
		it( 'should return true if olark is ready', () => {
			const isReady = isOlarkReady( {
				ui: {
					olark: {
						status: STATUS_READY
					}
				}
			} );
			expect( isReady ).to.equal( true );
		} );
	} );
	describe( '#isOlarkTimedOut()', () => {
		it( 'should return false if olark has unknown status', () => {
			const isTimedOut = isOlarkTimedOut( {
				ui: {
					olark: {
						status: null
					}
				}
			} );
			expect( isTimedOut ).to.equal( false );
		} );
		it( 'should return true if olark is timed out', () => {
			const isTimedOut = isOlarkTimedOut( {
				ui: {
					olark: {
						status: STATUS_TIMEOUT
					}
				}
			} );
			expect( isTimedOut ).to.equal( true );
		} );
		it( 'should return false if olark is ready', () => {
			const isTimedOut = isOlarkTimedOut( {
				ui: {
					olark: {
						status: STATUS_READY
					}
				}
			} );
			expect( isTimedOut ).to.equal( false );
		} );
	} );
	describe( '#isRequestingOlark()', () => {
		it( 'should return false if olark is not requesting', () => {
			const isRequesting = isRequestingOlark( {
				ui: {
					olark: {
						requesting: false
					}
				}
			} );
			expect( isRequesting ).to.equal( false );
		} );
		it( 'should return true if olark is requesting', () => {
			const isRequesting = isRequestingOlark( {
				ui: {
					olark: {
						requesting: true
					}
				}
			} );
			expect( isRequesting ).to.equal( true );
		} );
	} );
} );
