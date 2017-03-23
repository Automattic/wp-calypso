/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	STATUS_ERROR,
	STATUS_INITIALIZING,
	STATUS_READY,
	STATUS_UNINITIALIZED,
} from 'state/help/directly/constants';

import { isDirectlyFailed } from '../';

describe( 'isDirectlyFailed()', () => {
	it( 'should be false when uninitialized', () => {
		const state = { help: { directly: { status: STATUS_UNINITIALIZED } } };
		expect( isDirectlyFailed( state ) ).to.be.false;
	} );

	it( 'should be false when initializing', () => {
		const state = { help: { directly: { status: STATUS_INITIALIZING } } };
		expect( isDirectlyFailed( state ) ).to.be.false;
	} );

	it( 'should be false when ready', () => {
		const state = { help: { directly: { status: STATUS_READY } } };
		expect( isDirectlyFailed( state ) ).to.be.false;
	} );

	it( 'should be true when failed', () => {
		const state = { help: { directly: { status: STATUS_ERROR } } };
		expect( isDirectlyFailed( state ) ).to.be.true;
	} );
} );
