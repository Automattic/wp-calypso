/**
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import { expect } from 'chai';
import moment from 'moment';

/**
 * Internal dependencies
 */
import { isUserNewerThan } from '../contexts';

jest.mock( 'calypso/layout/guided-tours/config', () => {
	return require( 'calypso/state/guided-tours/test/fixtures/config' );
} );

const WEEK_IN_MILLISECONDS = 7 * 1000 * 3600 * 24;

describe( 'selectors', () => {
	describe( '#isUserNewerThan', () => {
		const oldUser = {
			currentUser: {
				id: 73705554,
				user: { ID: 73705554, login: 'testonesite2016', date: moment().subtract( 8, 'days' ) },
			},
		};

		const newUser = {
			currentUser: {
				id: 73705554,
				user: { ID: 73705554, login: 'testonesite2016', date: moment() },
			},
		};

		test( 'should return false for users registered before a week ago', () => {
			expect( isUserNewerThan( WEEK_IN_MILLISECONDS )( oldUser ) ).to.be.false;
		} );

		test( 'should return true for users registered in the last week', () => {
			expect( isUserNewerThan( WEEK_IN_MILLISECONDS )( newUser ) ).to.be.true;
		} );
	} );
} );
