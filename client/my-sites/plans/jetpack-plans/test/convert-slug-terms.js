import {
	PLAN_JETPACK_COMPLETE,
	PLAN_JETPACK_PERSONAL_MONTHLY,
	PLAN_JETPACK_SECURITY_T2_MONTHLY,
	PLAN_JETPACK_SECURITY_T2_YEARLY,
	PLAN_P2_PLUS,
	PLAN_PREMIUM,
	PRODUCT_JETPACK_ANTI_SPAM_MONTHLY,
	PRODUCT_JETPACK_BACKUP_DAILY,
	PRODUCT_JETPACK_SCAN,
	PRODUCT_JETPACK_SCAN_MONTHLY,
	TERM_ANNUALLY,
	TERM_MONTHLY,
	TITAN_MAIL_MONTHLY_SLUG,
} from '@automattic/calypso-products';
import { getSlugInTerm } from '../convert-slug-terms';

describe( 'getSlugInTerm', () => {
	test.each( [
		[ PRODUCT_JETPACK_BACKUP_DAILY, TERM_ANNUALLY, PRODUCT_JETPACK_BACKUP_DAILY ],
		[ PRODUCT_JETPACK_ANTI_SPAM_MONTHLY, TERM_MONTHLY, PRODUCT_JETPACK_ANTI_SPAM_MONTHLY ],
		[ PRODUCT_JETPACK_SCAN, TERM_MONTHLY, PRODUCT_JETPACK_SCAN_MONTHLY ],
		[ PRODUCT_JETPACK_SCAN_MONTHLY, TERM_ANNUALLY, PRODUCT_JETPACK_SCAN ],
	] )( 'returns the correct product slug for a given duration', ( slug, duration, expected ) => {
		expect( getSlugInTerm( slug, duration ) ).toBe( expected );
	} );

	test.each( [
		[ PLAN_JETPACK_COMPLETE, TERM_ANNUALLY, PLAN_JETPACK_COMPLETE ],
		[ PLAN_JETPACK_PERSONAL_MONTHLY, TERM_MONTHLY, PLAN_JETPACK_PERSONAL_MONTHLY ],
		[ PLAN_JETPACK_SECURITY_T2_YEARLY, TERM_MONTHLY, PLAN_JETPACK_SECURITY_T2_MONTHLY ],
		[ PLAN_JETPACK_SECURITY_T2_MONTHLY, TERM_ANNUALLY, PLAN_JETPACK_SECURITY_T2_YEARLY ],
	] )( 'returns the correct plan slug for a given duration', ( slug, duration, expected ) => {
		expect( getSlugInTerm( slug, duration ) ).toBe( expected );
	} );

	test( 'returns null if the slug is null', () => {
		expect( getSlugInTerm( null ) ).toBeNull();
	} );

	test.each( [
		[ TITAN_MAIL_MONTHLY_SLUG ],
		[ PLAN_P2_PLUS ],
		[ PLAN_PREMIUM ],
		[ 'randomstring' ],
	] )( 'returns null if the slug is not a Jetpack product or plan', ( slug ) => {
		expect( getSlugInTerm( slug ) ).toBeNull();
	} );
} );
