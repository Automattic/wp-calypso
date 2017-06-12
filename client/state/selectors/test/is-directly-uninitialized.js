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

import { isDirectlyUninitialized } from '../';

describe( 'isDirectlyUninitialized()', () => {
	it( 'should be true when uninitialized', () => {
		const state = { help: { directly: { status: STATUS_UNINITIALIZED } } };
		expect( isDirectlyUninitialized( state ) ).to.be.true;
	} );

	it( 'should be false when initializing', () => {
		const state = { help: { directly: { status: STATUS_INITIALIZING } } };
		expect( isDirectlyUninitialized( state ) ).to.be.false;
	} );

	it( 'should be false when ready', () => {
		const state = { help: { directly: { status: STATUS_READY } } };
		expect( isDirectlyUninitialized( state ) ).to.be.false;
	} );

	it( 'should be false when failed', () => {
		const state = { help: { directly: { status: STATUS_ERROR } } };
		expect( isDirectlyUninitialized( state ) ).to.be.false;
	} );
} );
