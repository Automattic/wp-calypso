/**
 * @jest-environment <rootDir>/../test/client/jest-environment-timezone.js
 */
import { TitanMailSlugs } from '@automattic/api-core';
import MockDate from 'mockdate';
import { getMailboxCost } from '../get-mailbox-cost';
import type { Domain, Product } from '@automattic/api-core';

const domain = {
	titan_mail_subscription: { is_eligible_for_introductory_offer: true },
} as Domain;

const product = {
	product_slug: TitanMailSlugs.TITAN_MAIL_MONTHLY_SLUG,
	currency_code: 'USD',
	cost: 35,
	combined_cost_display: '$3.50',
	product_term_localized: 'month',
	introductory_offer: {
		cost_per_interval: 0,
		interval_count: 3,
		interval_unit: 'month',
	},
} as Product;

function getTrialMessage() {
	return getMailboxCost( {
		domain,
		product,
		showEmailPurchaseDisabledMessage: false,
		locale: 'en',
	} ).message;
}

describe( 'getMailboxCost', () => {
	const originalTZ = process.env.TZ;

	afterEach( () => {
		MockDate.reset();
		process.env.TZ = originalTZ;
	} );

	describe( 'free trial end date', () => {
		test( 'shows the UTC end of the trial in the viewer time zone west of UTC', () => {
			process.env.TZ = 'America/Argentina/Buenos_Aires';
			// Oct 16, 10:00 local. The trial ends Jan 16 00:00 UTC, Jan 15 21:00 local.
			MockDate.set( '2026-10-16T13:00:00Z' );

			expect( getTrialMessage() ).toContain( 'January 15, 2027' );
		} );

		test( 'counts from the UTC date when it is already tomorrow in UTC', () => {
			process.env.TZ = 'America/Argentina/Buenos_Aires';
			// Oct 15, 22:00 local, but already Oct 16 in UTC.
			MockDate.set( '2026-10-16T01:00:00Z' );

			expect( getTrialMessage() ).toContain( 'January 15, 2027' );
		} );

		test( 'counts from the UTC date when it is still yesterday in UTC east of UTC', () => {
			process.env.TZ = 'Asia/Tokyo';
			// Oct 16, 05:00 local, still Oct 15 in UTC. The trial ends Jan 15 00:00 UTC.
			MockDate.set( '2026-10-15T20:00:00Z' );

			expect( getTrialMessage() ).toContain( 'January 15, 2027' );
		} );

		test( 'shows the UTC date in UTC', () => {
			process.env.TZ = 'UTC';
			MockDate.set( '2026-10-16T13:00:00Z' );

			expect( getTrialMessage() ).toContain( 'January 16, 2027' );
		} );
	} );
} );
