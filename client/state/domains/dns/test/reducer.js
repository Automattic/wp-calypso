import deepFreeze from 'deep-freeze';
import { DOMAINS_DNS_DELETE } from 'calypso/state/action-types';
import reducer from '../reducer';

const DOMAIN = 'example.com';

// `DOMAINS_DNS_DELETE` runs the record through `findDnsIndex` and flags the
// matched record with `isBeingDeleted`, so it exercises the matching logic.
const stateWith = ( records ) => deepFreeze( { [ DOMAIN ]: { records } } );
const deleteAction = ( record ) => ( { type: DOMAINS_DNS_DELETE, domainName: DOMAIN, record } );

describe( 'dns reducer — record matching', () => {
	const recordA = { id: 'wpcom:A:1', data: '1.1.1.1', name: 'a.', type: 'A' };
	const recordB = { id: 'wpcom:A:2', data: '2.2.2.2', name: 'b.', type: 'A' };

	test( 'matches a record by its full set of fields', () => {
		const state = reducer( stateWith( [ recordA, recordB ] ), deleteAction( recordB ) );

		expect( state[ DOMAIN ].records[ 1 ].isBeingDeleted ).toBe( true );
		expect( state[ DOMAIN ].records[ 0 ].isBeingDeleted ).toBeUndefined();
	} );

	test( 'matches a record passed without an id against a stored record that has one', () => {
		// New records can be acted on before the server assigns an id, so the
		// match must rely only on the fields present on the incoming record.
		const { id, ...recordAWithoutId } = recordA;
		const state = reducer( stateWith( [ recordA, recordB ] ), deleteAction( recordAWithoutId ) );

		expect( state[ DOMAIN ].records[ 0 ].isBeingDeleted ).toBe( true );
		expect( state[ DOMAIN ].records[ 0 ].id ).toBe( 'wpcom:A:1' );
		expect( state[ DOMAIN ].records[ 1 ].isBeingDeleted ).toBeUndefined();
	} );

	test( 'leaves state unchanged when no record matches', () => {
		const initial = stateWith( [ recordA, recordB ] );
		const state = reducer( initial, deleteAction( { data: '9.9.9.9', name: 'z.', type: 'A' } ) );

		expect( state ).toBe( initial );
	} );

	test( 'no-ops when a record action arrives before records have loaded', () => {
		// A domain can exist with `records: null` after a fetch is dispatched but
		// before it completes; matching against it must not throw.
		const initial = stateWith( null );
		const state = reducer( initial, deleteAction( recordA ) );

		expect( state ).toBe( initial );
	} );
} );
