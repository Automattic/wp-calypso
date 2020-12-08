/**
 * External dependencies
 */
import deepFreeze from 'deep-freeze';
import { pick } from 'lodash';

/**
 * Internal dependencies
 */
import reducer from '../reducer';
import { DOMAIN_NAME, RECORD_A, RECORD_NS, RECORD_TXT } from './data';
import { DOMAINS_DNS_DELETE_COMPLETED } from 'calypso/state/action-types';

describe( 'reducer', () => {
	test( 'should return the same state when no matching record passed in the delete action', () => {
		const state = deepFreeze( {
			[ DOMAIN_NAME ]: {
				records: [ RECORD_A, RECORD_NS ],
			},
		} );
		const action = {
			type: DOMAINS_DNS_DELETE_COMPLETED,
			domainName: DOMAIN_NAME,
			record: RECORD_TXT,
		};

		const result = reducer( state, action );

		expect( result ).toBe( state );
	} );

	test( 'should return state without record passed in the delete action', () => {
		const state = deepFreeze( {
			[ DOMAIN_NAME ]: {
				records: [ RECORD_A, RECORD_NS, RECORD_TXT ],
			},
		} );
		const action = {
			type: DOMAINS_DNS_DELETE_COMPLETED,
			domainName: DOMAIN_NAME,
			record: RECORD_TXT,
		};

		const result = reducer( state, action );

		expect( result ).toEqual( { [ DOMAIN_NAME ]: { records: [ RECORD_A, RECORD_NS ] } } );
	} );

	test( 'should return state without record (having no id) passed in the delete action', () => {
		const RECORD_TXT_WITHOUT_ID = pick( RECORD_TXT, [ 'data', 'name', 'type' ] );
		const state = deepFreeze( {
			[ DOMAIN_NAME ]: {
				records: [ RECORD_A, RECORD_NS, RECORD_TXT_WITHOUT_ID ],
			},
		} );
		const action = {
			type: DOMAINS_DNS_DELETE_COMPLETED,
			domainName: DOMAIN_NAME,
			record: RECORD_TXT_WITHOUT_ID,
		};

		const result = reducer( state, action );

		expect( result ).toEqual( { [ DOMAIN_NAME ]: { records: [ RECORD_A, RECORD_NS ] } } );
	} );
} );
