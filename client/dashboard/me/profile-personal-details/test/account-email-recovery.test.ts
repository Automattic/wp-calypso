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
		[ 'owner@yahoo.co.jp', false ],
		[ 'owner@ymail.ne.jp', false ],
		[ 'owner@live.ca', false ],
		[ 'owner@gmx.fr', false ],
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

	test.each( [
		[ ' student@College.edu ', ' Backup@college.EDU ', false, false ],
		[ 'jane@mycompany.com', 'admin@mycompany.com', true, true ],
		[ 'jane@mycompany.com', 'personal@gmail.com', false, true ],
		[ 'jane@gmail.com', 'personal@gmail.com', false, true ],
	] )(
		'checks recovery for %s with backup %s and verified phone %s',
		( email, verifiedEmail, hasVerifiedPhone, expected ) => {
			expect( hasVerifiedAccountRecovery( email, { verifiedEmail, hasVerifiedPhone } ) ).toBe(
				expected
			);
		}
	);

	test( 'a six-month reminder uses the last day of a shorter expiry month', () => {
		const until = getAccountEmailRecoverySnoozeUntil( new Date( '2026-08-31T12:00:00Z' ) );
		expect( new Date( until * 1000 ).toISOString() ).toBe( '2027-02-28T12:00:00.000Z' );
	} );
} );
