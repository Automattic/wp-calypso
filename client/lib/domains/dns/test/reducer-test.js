/**
 * External dependencies
 */
import { expect } from 'chai';
import pick from 'lodash/object/pick';

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

	it( 'should return state without record (having no id) passed in the delete action', () => {
		const RECORD_TXT_WITHOUT_ID = pick( RECORD_TXT, [ 'data', 'name', 'type' ] ),
			state = {
				[ DOMAIN_NAME ]: {
					records: [ RECORD_TXT_WITHOUT_ID ]
				}
			},
			payload = {
				action: {
					type: ActionTypes.DNS_DELETE,
					domainName: DOMAIN_NAME,
					record: RECORD_TXT_WITHOUT_ID
				}
			};

		const result = reducer( state, payload );

		expect( result ).to.be.eql( { [ DOMAIN_NAME ]: { records: [] } } );
	} );
} );
