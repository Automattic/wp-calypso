jest.mock( 'state/current-user/selectors', () => ( {
	getCurrentUserDate: require( 'sinon' ).stub()
} ) );

/**
 * External dependencies
 */
import { expect } from 'chai';
import { stub } from 'sinon';

/**
 * Internal dependencies
 */
import { getCurrentUserDate } from 'state/current-user/selectors';
import isUserRegistrationDaysWithinRange from '../is-user-registration-days-within-range';

describe( 'isUserRegistrationDaysWithinRange()', () => {
	const state = 'state';
	const registrationDate = 'registrationDate';
	const moment = {
		diff: stub()
	};

	it( 'should return null when there is no current user date', () => {
		getCurrentUserDate.withArgs( state ).returns( null );
		expect( isUserRegistrationDaysWithinRange( state, moment, 5, 10 ) ).to.be.null;
	} );

	describe( 'when there is a current user date', () => {
		before( () => {
			getCurrentUserDate.withArgs( state ).returns( registrationDate );
		} );

		it( 'should return false when user has been registered for less than the lower bound', () => {
			moment.diff.withArgs( registrationDate, 'days', true ).returns( 1 );
			expect( isUserRegistrationDaysWithinRange( state, moment, 5, 10 ) ).to.be.false;
		} );

		it( 'should return true when user has been registered for exactly the lower bound', () => {
			moment.diff.withArgs( registrationDate, 'days', true ).returns( 5 );
			expect( isUserRegistrationDaysWithinRange( state, moment, 5, 10 ) ).to.be.true;
		} );

		it( 'should return true when user has been registered for greater than the lower bound and less than the upper bound', () => {
			moment.diff.withArgs( registrationDate, 'days', true ).returns( 7 );
			expect( isUserRegistrationDaysWithinRange( state, moment, 5, 10 ) ).to.be.true;
		} );

		it( 'should return true when user has been registered for exactly the upper bound', () => {
			moment.diff.withArgs( registrationDate, 'days', true ).returns( 10 );
			expect( isUserRegistrationDaysWithinRange( state, moment, 5, 10 ) ).to.be.true;
		} );

		it( 'should return false when user has been registered for greater than the upper bound', () => {
			moment.diff.withArgs( registrationDate, 'days', true ).returns( 15 );
			expect( isUserRegistrationDaysWithinRange( state, moment, 5, 10 ) ).to.be.false;
		} );
	} );
} );
