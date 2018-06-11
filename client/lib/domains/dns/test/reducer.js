/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';
import { pick } from 'lodash';

/**
 * Internal dependencies
 */
import { reducer } from '../reducer';
import { DOMAIN_NAME, RECORD_A, RECORD_TXT } from './data';
import * as ActionTypes from 'lib/upgrades/action-types';

describe( 'reducer', () => {
	test( 'should return the same state when no matching record passed in the delete action', () => {
		const state = deepFreeze( {
				[ DOMAIN_NAME ]: {
					records: [ RECORD_A ],
				},
			} ),
			payload = {
				action: {
					type: ActionTypes.DNS_DELETE_COMPLETED,
					domainName: DOMAIN_NAME,
					record: RECORD_TXT,
				},
			};

		const result = reducer( state, payload );

		expect( result ).to.be.equal( state );
	} );

	test( 'should return state without record passed in the delete action', () => {
		const state = deepFreeze( {
				[ DOMAIN_NAME ]: {
					records: [ RECORD_A, RECORD_TXT ],
				},
			} ),
			payload = {
				action: {
					type: ActionTypes.DNS_DELETE_COMPLETED,
					domainName: DOMAIN_NAME,
					record: RECORD_TXT,
				},
			};

		const result = reducer( state, payload );

		expect( result ).to.be.eql( { [ DOMAIN_NAME ]: { records: [ RECORD_A ] } } );
	} );

	test( 'should return state without record (having no id) passed in the delete action', () => {
		const RECORD_TXT_WITHOUT_ID = pick( RECORD_TXT, [ 'data', 'name', 'type' ] ),
			state = deepFreeze( {
				[ DOMAIN_NAME ]: {
					records: [ RECORD_A, RECORD_TXT_WITHOUT_ID ],
				},
			} ),
			payload = {
				action: {
					type: ActionTypes.DNS_DELETE_COMPLETED,
					domainName: DOMAIN_NAME,
					record: RECORD_TXT_WITHOUT_ID,
				},
			};

		const result = reducer( state, payload );

		expect( result ).to.be.eql( { [ DOMAIN_NAME ]: { records: [ RECORD_A ] } } );
	} );
} );
