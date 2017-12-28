/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';
import { stub } from 'sinon';

/**
 * Internal dependencies
 */
import isUserRegistrationDaysWithinRange from '../is-user-registration-days-within-range';
import { getCurrentUserDate } from 'client/state/current-user/selectors';
jest.mock( 'state/current-user/selectors', () => ( {
	getCurrentUserDate: require( 'sinon' ).stub(),
} ) );

describe( 'isUserRegistrationDaysWithinRange()', () => {
	const state = 'state';
	const registrationDate = 'registrationDate';
	const moment = {
		diff: stub(),
	};

	test( 'should return null when there is no current user date', () => {
		getCurrentUserDate.withArgs( state ).returns( null );
		expect( isUserRegistrationDaysWithinRange( state, moment, 5, 10 ) ).to.be.null;
	} );

	describe( 'when there is a current user date', () => {
		beforeAll( () => {
			getCurrentUserDate.withArgs( state ).returns( registrationDate );
		} );

		test( 'should return false when user has been registered for less than the lower bound', () => {
			moment.diff.withArgs( registrationDate, 'days', true ).returns( 1 );
			expect( isUserRegistrationDaysWithinRange( state, moment, 5, 10 ) ).to.be.false;
		} );

		test( 'should return true when user has been registered for exactly the lower bound', () => {
			moment.diff.withArgs( registrationDate, 'days', true ).returns( 5 );
			expect( isUserRegistrationDaysWithinRange( state, moment, 5, 10 ) ).to.be.true;
		} );

		test( 'should return true when user has been registered for greater than the lower bound and less than the upper bound', () => {
			moment.diff.withArgs( registrationDate, 'days', true ).returns( 7 );
			expect( isUserRegistrationDaysWithinRange( state, moment, 5, 10 ) ).to.be.true;
		} );

		test( 'should return true when user has been registered for exactly the upper bound', () => {
			moment.diff.withArgs( registrationDate, 'days', true ).returns( 10 );
			expect( isUserRegistrationDaysWithinRange( state, moment, 5, 10 ) ).to.be.true;
		} );

		test( 'should return false when user has been registered for greater than the upper bound', () => {
			moment.diff.withArgs( registrationDate, 'days', true ).returns( 15 );
			expect( isUserRegistrationDaysWithinRange( state, moment, 5, 10 ) ).to.be.false;
		} );
	} );
} );
