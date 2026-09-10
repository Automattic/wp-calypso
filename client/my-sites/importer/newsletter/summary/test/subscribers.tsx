/**
 * @jest-environment jsdom
 */

import { render, screen } from '@testing-library/react';
import { SubscribersStepContent } from 'calypso/data/paid-newsletter/use-paid-newsletter-query';
import SubscriberSummary from '../subscribers';

type Meta = NonNullable< SubscribersStepContent[ 'meta' ] >;

function stepContent( meta: Partial< Meta > ): SubscribersStepContent {
	return {
		is_connected_stripe: false,
		meta: {
			email_count: '0',
			subscribed_count: '0',
			already_subscribed_count: '0',
			failed_subscribed_count: '0',
			paid_subscribed_count: '0',
			paid_already_subscribed_count: '0',
			paid_failed_subscribed_count: '0',
			comp_subscribed_count: '0',
			comp_already_subscribed_count: '0',
			comp_failed_subscribed_count: '0',
			...meta,
		} as Meta,
	} as SubscribersStepContent;
}

function statFor( label: string ) {
	const row = screen.getByText( label ).closest( '.summary__content-row' );
	return row?.querySelector( '.summary__content-stats-count' )?.textContent;
}

describe( '<SubscriberSummary>', () => {
	it( 'does not count comps the server could not grant as "Not imported"', () => {
		// They arrived as free subscribers, so counting them again here would exceed the total.
		render(
			<SubscriberSummary
				status="done"
				stepContent={ stepContent( {
					email_count: '8',
					subscribed_count: '8',
					comp_count: 2,
					comp_failed_subscribed_count: '2',
					comp_skip_reason: 'no_tier',
				} ) }
			/>
		);

		expect( statFor( 'Total Subscribers' ) ).toBe( '8' );
		expect( statFor( 'Free Subscribers' ) ).toBe( '8' );
		expect( screen.queryByText( 'Not imported' ) ).not.toBeInTheDocument();
		expect( screen.queryByText( 'Comped Subscribers' ) ).not.toBeInTheDocument();
		expect(
			screen.getByText(
				'2 comped subscribers were added as free subscribers. Set up a paid tier to give them complimentary access.'
			)
		).toBeVisible();
	} );

	it( 'still reports comps that failed for their own reasons', () => {
		render(
			<SubscriberSummary
				status="done"
				stepContent={ stepContent( {
					email_count: '8',
					subscribed_count: '6',
					comp_count: 2,
					comp_subscribed_count: '1',
					comp_failed_subscribed_count: '1',
				} ) }
			/>
		);

		expect( statFor( 'Comped Subscribers' ) ).toBe( '1' );
		expect( statFor( 'Not imported' ) ).toBe( '1' );
	} );

	it( 'counts comps that were already subscribed as duplicates', () => {
		render(
			<SubscriberSummary
				status="done"
				stepContent={ stepContent( {
					email_count: '8',
					subscribed_count: '6',
					comp_count: 2,
					comp_subscribed_count: '1',
					comp_already_subscribed_count: '1',
				} ) }
			/>
		);

		expect( statFor( 'Total Subscribers' ) ).toBe( '8' );
		expect( statFor( 'Free Subscribers' ) ).toBe( '6' );
		expect( statFor( 'Comped Subscribers' ) ).toBe( '1' );
		expect( statFor( 'Skipped (duplicate)' ) ).toBe( '1' );
		expect( screen.queryByText( 'Not imported' ) ).not.toBeInTheDocument();
	} );

	it( 'explains a comp tier that disappeared before the import ran', () => {
		render(
			<SubscriberSummary
				status="done"
				stepContent={ stepContent( {
					email_count: '3',
					subscribed_count: '3',
					comp_count: 1,
					comp_failed_subscribed_count: '1',
					comp_skip_reason: 'chosen_tier_gone',
				} ) }
			/>
		);

		expect(
			screen.getByText(
				'1 comped subscriber was added as a free subscriber. The paid tier you chose no longer exists.'
			)
		).toBeVisible();
	} );
} );
