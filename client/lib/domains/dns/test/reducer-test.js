/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { action as ActionTypes } from 'lib/upgrades/constants';
import { DOMAIN_NAME, RECORD_A, RECORD_TXT } from 'data';
import { reducer } from '../reducer';

describe( 'Domains: DNS reducer', () => {
	it( 'should return the same state when no matching record passed in the delete action', () => {
		const state = {
				[ DOMAIN_NAME ]: {
					records: [ RECORD_A ]
				}
			},
			payload = {
				action: {
					type: ActionTypes.DNS_DELETE,
					domainName: DOMAIN_NAME,
					record: RECORD_TXT
				}
			};

		const result = reducer( state, payload );

		expect( result ).to.be.equal( state );
	} );

	it( 'should return state without record passed in the delete action', () => {
		const state = {
				[ DOMAIN_NAME ]: {
					records: [ RECORD_TXT ]
				}
			},
			payload = {
				action: {
					type: ActionTypes.DNS_DELETE,
					domainName: DOMAIN_NAME,
					record: RECORD_TXT
				}
			};

		const result = reducer( state, payload );

		expect( result ).to.be.eql( { [ DOMAIN_NAME ]: { records: [] } } );
	} );
} );
