/**
 * Internal dependencies
 */
import isUserRegistrationDaysWithinRange from '../is-user-registration-days-within-range';
import { getCurrentUserDate } from 'calypso/state/current-user/selectors';
jest.mock( 'calypso/state/current-user/selectors', () => ( {
	getCurrentUserDate: require( 'sinon' ).stub(),
} ) );

describe( 'isUserRegistrationDaysWithinRange()', () => {
	const state = 'state';
	const registrationDate = '2019-03-15';

	test( 'should return null when there is no current user date', () => {
		getCurrentUserDate.withArgs( state ).returns( null );
		const refDate = registrationDate;
		expect( isUserRegistrationDaysWithinRange( state, refDate, 5, 10 ) ).toBe( null );
	} );

	describe( 'when there is a current user date', () => {
		beforeAll( () => {
			getCurrentUserDate.withArgs( state ).returns( registrationDate );
		} );

		test( 'should return false when user has been registered for less than the lower bound', () => {
			const refDate = new Date( '2019-03-16' );
			expect( isUserRegistrationDaysWithinRange( state, refDate, 5, 10 ) ).toBe( false );
		} );

		test( 'should return true when user has been registered for exactly the lower bound', () => {
			const refDate = new Date( '2019-03-20' );
			expect( isUserRegistrationDaysWithinRange( state, refDate, 5, 10 ) ).toBe( true );
		} );

		test( 'should return true when user has been registered for greater than the lower bound and less than the upper bound', () => {
			const refDate = new Date( '2019-03-22' );
			expect( isUserRegistrationDaysWithinRange( state, refDate, 5, 10 ) ).toBe( true );
		} );

		test( 'should return true when user has been registered for exactly the upper bound', () => {
			const refDate = new Date( '2019-03-25' );
			expect( isUserRegistrationDaysWithinRange( state, refDate, 5, 10 ) ).toBe( true );
		} );

		test( 'should return false when user has been registered for greater than the upper bound', () => {
			const refDate = new Date( '2019-03-30' );
			expect( isUserRegistrationDaysWithinRange( state, refDate, 5, 10 ) ).toBe( false );
		} );
	} );
} );
