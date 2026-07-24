/**
 * @jest-environment jsdom
 */
import page from '@automattic/calypso-router';
import { render, screen, fireEvent } from '@testing-library/react';
import { translate } from 'i18n-calypso';
import moment from 'moment';
import { PlanBillingPeriod } from '../billing-period';

const props = {
	purchase: {
		// Including the properties that are used by this component
		ID: 123,
		blog_id: 123,
		product_name: 'Jetpack Personal',
		product_slug: 'jetpack_premium_monthly',
		domain: 'site.com',
		expiry_status: 'active',
		subscription_status: 'active',
		payment_type: 'paypal',
	},
	site: {
		ID: 123,
		name: 'Site Name',
	},
	isProductOwner: true,
	recordTracksEvent: jest.fn(),
	translate,
	moment,
};

jest.mock( 'calypso/lib/cart-values/cart-items', () => ( {
	planItem: jest.fn(),
} ) );

jest.mock( '@automattic/calypso-router', () => jest.fn() );

describe( 'PlanBillingPeriod', () => {
	describe( 'a monthly plan', () => {
		it( 'should display the current period', () => {
			render( <PlanBillingPeriod { ...props } /> );
			expect( screen.getByText( /billed monthly/i ) ).toBeInTheDocument();
		} );

		it( 'should upgrade to a yearly plan when the button is clicked', () => {
			render( <PlanBillingPeriod { ...props } /> );
			const btn = screen.getByRole( 'button', { name: /upgrade/i } );
			fireEvent.click( btn );
			expect( page ).toHaveBeenCalledWith(
				'/checkout/site.com/jetpack_premium?upgrade_from=jetpack_premium_monthly'
			);
		} );

		it( 'should display a message instead of the upgrade button for a disconnected site', () => {
			render( <PlanBillingPeriod { ...props } site={ null } /> );

			expect( screen.queryAllByRole( 'button', { name: /upgrade/i } ) ).toHaveLength( 0 );
			expect( screen.getByText( /to manage your plan/i ) ).toHaveTextContent(
				'To manage your plan, please reconnect your site'
			);
		} );
	} );

	describe( 'an annual plan', () => {
		beforeEach( () => moment.locale( 'en' ) );

		const annualPlanProps = {
			...props,
			purchase: {
				...props.purchase,
				product_slug: 'jetpack_personal',
			},
		};

		it( 'should display the current period', () => {
			render( <PlanBillingPeriod { ...annualPlanProps } /> );
			expect( screen.getByText( /billed yearly/i ) ).toBeInTheDocument();
		} );

		describe( 'when credit card is expiring', () => {
			it( 'should display a warning to the user', () => {
				const planExpiryDate = moment().add( 3, 'months' ).format();
				const cardExpiryDate = moment().add( 1, 'months' ).format( 'MM/YY' );
				const purchase = {
					...annualPlanProps.purchase,
					expiry_date: planExpiryDate,
					payment_type: 'credit_card',
					payment_expiry: cardExpiryDate,
				};
				render( <PlanBillingPeriod { ...annualPlanProps } purchase={ purchase } /> );
				expect( screen.getByText( /billed yearly/i ) ).toHaveTextContent(
					'Billed yearly, credit card expiring soon'
				);
			} );
		} );

		describe( 'when plan is renewing', () => {
			it( 'should display a warning to the user', () => {
				const purchase = {
					...annualPlanProps.purchase,
					renew_date: moment( '2020-01-01' ).format(),
				};
				render( <PlanBillingPeriod { ...annualPlanProps } purchase={ purchase } /> );
				expect( screen.getByText( /billed yearly/i ) ).toHaveTextContent(
					'Billed yearly, renews on January 1, 2020'
				);
			} );
		} );

		describe( 'when plan is expiring', () => {
			it( 'should display a warning to the user', () => {
				// Use a future date - expiring plans should have a future expiry date
				const futureDate = moment().add( 1, 'month' );
				const purchase = {
					...annualPlanProps.purchase,
					expiry_date: futureDate.format(),
					expiry_status: 'expiring',
				};
				render( <PlanBillingPeriod { ...annualPlanProps } purchase={ purchase } /> );
				expect( screen.getByText( /billed yearly/i ) ).toHaveTextContent(
					`Billed yearly, expires on ${ futureDate.format( 'MMMM D, YYYY' ) }`
				);
			} );
		} );

		describe( 'when plan is expired', () => {
			it( 'should display a warning to the user', () => {
				const purchase = {
					...annualPlanProps.purchase,
					expiry_date: moment().subtract( 1, 'month' ).format(),
					expiry_status: 'expired',
				};
				render( <PlanBillingPeriod { ...annualPlanProps } purchase={ purchase } /> );
				expect( screen.getByText( /billed yearly/i ) ).toHaveTextContent(
					'Billed yearly, expired a month ago'
				);
			} );
		} );
	} );
} );
