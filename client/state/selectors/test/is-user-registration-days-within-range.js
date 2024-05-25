import { when } from 'jest-when';
import { getCurrentUserDate } from 'calypso/state/current-user/selectors';
import isUserRegistrationDaysWithinRange from '../is-user-registration-days-within-range';

jest.mock( 'calypso/state/current-user/selectors', () => ( {
	getCurrentUserDate: jest.fn(),
} ) );

describe( 'isUserRegistrationDaysWithinRange()', () => {
	const state = 'state';
	const registrationDate = '2019-03-15';

	test( 'should return null when there is no current user date', () => {
		when( getCurrentUserDate ).calledWith( state ).mockReturnValue( null );
		const refDate = registrationDate;
		expect( isUserRegistrationDaysWithinRange( state, refDate, 5, 10 ) ).toBe( null );
	} );

	describe( 'when there is a current user date', () => {
		beforeAll( () => {
			when( getCurrentUserDate ).calledWith( state ).mockReturnValue( registrationDate );
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
