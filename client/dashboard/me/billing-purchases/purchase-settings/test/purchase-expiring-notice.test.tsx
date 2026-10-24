/**
 * @jest-environment jsdom
 */

import { screen } from '@testing-library/react';
import { addDays, formatISO } from 'date-fns';
import { render } from '../../../../test-utils';
import { PurchaseExpiringNotice } from '../purchase-expiring-notice';
import type { Purchase } from '@automattic/api-core';

const expiryDate = '2027-01-22T12:00:00+00:00';

function makePurchase( overrides: Partial< Purchase > = {} ): Purchase {
	return {
		ID: 1,
		product_name: 'Professional Email',
		product_slug: 'wp_titan_mail_yearly',
		site_slug: 'example.com',
		expiry_status: 'expiring',
		expiry_date: expiryDate,
		bill_period_days: 365,
		...overrides,
	} as Purchase;
}

function makeTrialOffer( overrides = {} ) {
	return {
		is_within_period: true,
		cost_per_interval: 0,
		end_date: expiryDate,
		...overrides,
	} as Purchase[ 'introductory_offer' ];
}

describe( '<PurchaseExpiringNotice />', () => {
	beforeAll( () => {
		jest.useFakeTimers( { now: new Date( '2026-10-23T12:00:00+00:00' ), advanceTimers: true } );
	} );

	afterAll( () => {
		jest.useRealTimers();
	} );

	test( 'shows the free trial end date for a free introductory offer', () => {
		render(
			<PurchaseExpiringNotice
				purchase={ makePurchase( { introductory_offer: makeTrialOffer() } ) }
				purchaseAttachedTo={ undefined }
				isDomainWithoutSite={ false }
			/>
		);

		expect( screen.getByText( 'Your free trial ends on January 22, 2027.' ) ).toBeVisible();
	} );

	test( 'shows the expiry wording once the purchase renews past the trial', () => {
		render(
			<PurchaseExpiringNotice
				purchase={ makePurchase( {
					expiry_date: formatISO( addDays( new Date( expiryDate ), 365 ) ),
					introductory_offer: makeTrialOffer(),
				} ) }
				purchaseAttachedTo={ undefined }
				isDomainWithoutSite={ false }
			/>
		);

		expect( screen.queryByText( /free trial/ ) ).not.toBeInTheDocument();
		expect( screen.getByText( /will expire and be removed from your site/ ) ).toBeVisible();
	} );
} );
