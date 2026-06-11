import { computeEligibility, getSecurityLevel } from '../compute-eligibility';
import { SNOOZE_DAYS } from '../constants';
import type { EligibilityInput } from '../compute-eligibility';

const NOW = 1_700_000_000;
const DAY = 86400;

function input( overrides: Partial< EligibilityInput > = {} ): EligibilityInput {
	return {
		isLoaded: true,
		hasRecoveryEmail: false,
		hasRecoveryPhone: false,
		hasTwoFactor: false,
		snoozeUntil: undefined,
		now: NOW,
		...overrides,
	};
}

describe( 'getSecurityLevel', () => {
	test.each( [
		[ 'none when nothing is set up', false, false, false, 'none' ],
		[ 'partial with a recovery email but no 2FA', true, false, false, 'partial' ],
		[ 'partial with a recovery phone but no 2FA', false, true, false, 'partial' ],
		[ 'partial with 2FA but no recovery method', false, false, true, 'partial' ],
		[ 'strong with a recovery email and 2FA', true, false, true, 'strong' ],
		[ 'strong with a recovery phone and 2FA', false, true, true, 'strong' ],
	] )( 'is %s', ( _label, email, phone, twoFactor, expected ) => {
		expect( getSecurityLevel( email as boolean, phone as boolean, twoFactor as boolean ) ).toBe(
			expected
		);
	} );
} );

describe( 'computeEligibility', () => {
	test( 'is not eligible until the data has loaded', () => {
		expect( computeEligibility( input( { isLoaded: false } ) ).isEligible ).toBe( false );
	} );

	test( 'eligible for a user with nothing set up (none)', () => {
		const result = computeEligibility( input() );
		expect( result ).toEqual( {
			isEligible: true,
			securityLevel: 'none',
			snoozeDays: SNOOZE_DAYS.none,
		} );
	} );

	test( 'eligible for a user with a recovery method but no 2FA (partial)', () => {
		const result = computeEligibility( input( { hasRecoveryEmail: true } ) );
		expect( result ).toEqual( {
			isEligible: true,
			securityLevel: 'partial',
			snoozeDays: SNOOZE_DAYS.partial,
		} );
	} );

	test( 'eligible for a fully-covered user (strong) — periodic yearly re-check', () => {
		const result = computeEligibility( input( { hasRecoveryEmail: true, hasTwoFactor: true } ) );
		expect( result ).toEqual( {
			isEligible: true,
			securityLevel: 'strong',
			snoozeDays: SNOOZE_DAYS.strong,
		} );
	} );

	test( 'not eligible while an active snooze is in the future', () => {
		const result = computeEligibility( input( { snoozeUntil: NOW + 10 * DAY } ) );
		expect( result.isEligible ).toBe( false );
	} );

	test( 'eligible again once the snooze has expired', () => {
		const result = computeEligibility( input( { snoozeUntil: NOW - 1 } ) );
		expect( result.isEligible ).toBe( true );
	} );

	test( 'a snooze exactly at now is treated as expired (eligible)', () => {
		const result = computeEligibility( input( { snoozeUntil: NOW } ) );
		expect( result.isEligible ).toBe( true );
	} );
} );
