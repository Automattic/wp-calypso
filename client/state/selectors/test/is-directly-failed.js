import {
	STATUS_ERROR,
	STATUS_INITIALIZING,
	STATUS_READY,
	STATUS_UNINITIALIZED,
} from 'calypso/state/help/directly/constants';
import isDirectlyFailed from 'calypso/state/selectors/is-directly-failed';

describe( 'isDirectlyFailed()', () => {
	test( 'should be false when uninitialized', () => {
		const state = { help: { directly: { status: STATUS_UNINITIALIZED } } };
		expect( isDirectlyFailed( state ) ).toBe( false );
	} );

	test( 'should be false when initializing', () => {
		const state = { help: { directly: { status: STATUS_INITIALIZING } } };
		expect( isDirectlyFailed( state ) ).toBe( false );
	} );

	test( 'should be false when ready', () => {
		const state = { help: { directly: { status: STATUS_READY } } };
		expect( isDirectlyFailed( state ) ).toBe( false );
	} );

	test( 'should be true when failed', () => {
		const state = { help: { directly: { status: STATUS_ERROR } } };
		expect( isDirectlyFailed( state ) ).toBe( true );
	} );
} );
