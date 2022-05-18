import {
	STATUS_ERROR,
	STATUS_INITIALIZING,
	STATUS_READY,
	STATUS_UNINITIALIZED,
} from 'calypso/state/help/directly/constants';
import isDirectlyUninitialized from 'calypso/state/selectors/is-directly-uninitialized';

describe( 'isDirectlyUninitialized()', () => {
	test( 'should be true when uninitialized', () => {
		const state = { help: { directly: { status: STATUS_UNINITIALIZED } } };
		expect( isDirectlyUninitialized( state ) ).toBe( true );
	} );

	test( 'should be false when initializing', () => {
		const state = { help: { directly: { status: STATUS_INITIALIZING } } };
		expect( isDirectlyUninitialized( state ) ).toBe( false );
	} );

	test( 'should be false when ready', () => {
		const state = { help: { directly: { status: STATUS_READY } } };
		expect( isDirectlyUninitialized( state ) ).toBe( false );
	} );

	test( 'should be false when failed', () => {
		const state = { help: { directly: { status: STATUS_ERROR } } };
		expect( isDirectlyUninitialized( state ) ).toBe( false );
	} );
} );
