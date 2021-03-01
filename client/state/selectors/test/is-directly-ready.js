/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import isDirectlyReady from 'calypso/state/selectors/is-directly-ready';
import {
	STATUS_ERROR,
	STATUS_INITIALIZING,
	STATUS_READY,
	STATUS_UNINITIALIZED,
} from 'calypso/state/help/directly/constants';

describe( 'isDirectlyReady()', () => {
	test( 'should be false when uninitialized', () => {
		const state = { help: { directly: { status: STATUS_UNINITIALIZED } } };
		expect( isDirectlyReady( state ) ).to.be.false;
	} );

	test( 'should be false when initializing', () => {
		const state = { help: { directly: { status: STATUS_INITIALIZING } } };
		expect( isDirectlyReady( state ) ).to.be.false;
	} );

	test( 'should be true when ready', () => {
		const state = { help: { directly: { status: STATUS_READY } } };
		expect( isDirectlyReady( state ) ).to.be.true;
	} );

	test( 'should be false when failed', () => {
		const state = { help: { directly: { status: STATUS_ERROR } } };
		expect( isDirectlyReady( state ) ).to.be.false;
	} );
} );
