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

import { isDirectlyReady } from '../';

describe( 'isDirectlyReady()', () => {
	it( 'should be false when uninitialized', () => {
		const state = { help: { directly: { status: STATUS_UNINITIALIZED } } };
		expect( isDirectlyReady( state ) ).to.be.false;
	} );

	it( 'should be false when initializing', () => {
		const state = { help: { directly: { status: STATUS_INITIALIZING } } };
		expect( isDirectlyReady( state ) ).to.be.false;
	} );

	it( 'should be true when ready', () => {
		const state = { help: { directly: { status: STATUS_READY } } };
		expect( isDirectlyReady( state ) ).to.be.true;
	} );

	it( 'should be false when failed', () => {
		const state = { help: { directly: { status: STATUS_ERROR } } };
		expect( isDirectlyReady( state ) ).to.be.false;
	} );
} );
