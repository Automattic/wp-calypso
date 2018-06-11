/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import { reducer } from './../reducer';
import { DOMAIN_NAME, EMAIL_FORWARDS, MAILBOX_NAME } from './data';
import { action as ActionTypes } from 'lib/upgrades/action-types';

describe( 'reducer', () => {
	test( 'should return the same state when no matching record passed in the delete complete action', () => {
		const state = deepFreeze( {
				[ DOMAIN_NAME ]: {
					list: EMAIL_FORWARDS,
				},
			} ),
			payload = {
				action: {
					type: ActionTypes.EMAIL_FORWARDING_DELETE_COMPLETED,
					domainName: DOMAIN_NAME,
					mailbox: 'unknown',
				},
			};

		const result = reducer( state, payload );

		expect( result ).to.be.eql( {
			[ DOMAIN_NAME ]: {
				list: EMAIL_FORWARDS,
			},
		} );
	} );

	test( 'should return state without record passed in the delete completed action', () => {
		const state = deepFreeze( {
				[ DOMAIN_NAME ]: {
					list: EMAIL_FORWARDS,
				},
			} ),
			payload = {
				action: {
					type: ActionTypes.EMAIL_FORWARDING_DELETE_COMPLETED,
					domainName: DOMAIN_NAME,
					mailbox: MAILBOX_NAME,
				},
			};

		const result = reducer( state, payload );

		expect( result ).to.be.eql( {
			[ DOMAIN_NAME ]: {
				list: [],
				needsUpdate: true,
			},
		} );
	} );
} );
