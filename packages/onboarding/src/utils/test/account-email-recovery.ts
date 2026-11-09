import {
	getAccountEmailRecoverySnoozeUntil,
	hasVerifiedAccountRecovery,
	isAccountEmailAtRisk,
} from '../account-email-recovery';

describe( 'account email recovery warning', () => {
	test.each( [
		[ 'owner@MYyahoo.com', false ],
		[ 'owner@outlook.es', false ],
		[ 'owner@aol.com', false ],
		[ 'owner@yahoo.school.edu', true ],
		[ 'owner@shaw.ca', true ],
		[ 'owner@work.example.com', true ],
		[ 'owner@gmail.commmm', false ],
	] )( 'classifies %s', ( email, atRisk ) => {
		expect( isAccountEmailAtRisk( email ) ).toBe( atRisk );
	} );

	test( 'a verified backup cannot be the proposed sign-in mailbox', () => {
		const recovery = { verifiedEmail: 'Student@College.edu', hasVerifiedPhone: false };
		expect( hasVerifiedAccountRecovery( 'student@college.edu', recovery ) ).toBe( false );
		expect( hasVerifiedAccountRecovery( 'staff@employer.com', recovery ) ).toBe( true );
	} );

	test( 'a six-month reminder uses the last day of a shorter expiry month', () => {
		const until = getAccountEmailRecoverySnoozeUntil( new Date( '2026-08-31T12:00:00Z' ) );
		expect( new Date( until * 1000 ).toISOString() ).toBe( '2027-02-28T12:00:00.000Z' );
	} );
} );
