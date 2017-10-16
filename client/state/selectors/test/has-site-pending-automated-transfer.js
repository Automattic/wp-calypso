/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';
import moment from 'moment';

/**
 * Internal dependencies
 */
import { hasSitePendingAutomatedTransfer } from '../';

const aMinuteAgo = moment().subtract( 1, 'minute' );
const elevenMinutesAgo = moment().subtract( 11, 'minute' );

describe( 'hasSitePendingAutomatedTransfer()', () => {
	test( 'should return false if site is an Atomic one', () => {
		const state = {
			sites: {
				items: {
					12345: {
						options: {
							is_automated_transfer: true,
							signup_is_store: true,
							created_at: aMinuteAgo,
						},
					},
				},
			},
		};

		expect( hasSitePendingAutomatedTransfer( state, 12345 ) ).to.be.false;
	} );

	test( 'should return true if site is a "store" one and is younger than 10 minutes', () => {
		const state = {
			sites: {
				items: {
					12345: {
						options: {
							signup_is_store: true,
							created_at: aMinuteAgo,
						},
					},
				},
			},
		};

		expect( hasSitePendingAutomatedTransfer( state, 12345 ) ).to.be.true;
	} );

	test( 'should return false if site is a "store" one and is older than 10 minutes', () => {
		const state = {
			sites: {
				items: {
					12345: {
						options: {
							signup_is_store: true,
							created_at: elevenMinutesAgo,
						},
					},
				},
			},
		};

		expect( hasSitePendingAutomatedTransfer( state, 12345 ) ).to.be.false;
	} );
} );
