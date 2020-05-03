/**
 * External dependencies
 */
import { shallow } from 'enzyme';
import React from 'react';
import moment from 'moment';
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { PlanBillingPeriod } from '../billing-period';
import page from 'page';
import { planItem } from 'lib/cart-values/cart-items';
import { addItem } from 'lib/cart/actions';

const props = {
	purchase: {
		// Including only the properties that are used by this component
		id: 123,
		siteId: 123,
		productName: 'Jetpack Personal',
		productSlug: 'jetpack_premium_monthly',
		domain: 'site.com',
		expiryStatus: 'active',
		payment: {
			type: 'paypal',
		},
	},
	site: {
		ID: 123,
		name: 'Site Name',
	},
	recordTracksEvent: jest.fn(),
	translate,
	moment,
};

jest.mock( 'lib/cart-values/cart-items', () => ( {
	planItem: jest.fn(),
} ) );

jest.mock( 'lib/cart/actions', () => ( {
	addItem: jest.fn(),
} ) );

jest.mock( 'page', () => jest.fn() );

describe( 'PlanBillingPeriod', () => {
	describe( 'a monthly plan', () => {
		it( 'should display the current period', () => {
			const wrapper = shallow( <PlanBillingPeriod { ...props } /> );
			expect( wrapper.find( 'FormSettingExplanation' ).shallow().text() ).toContain(
				'Billed monthly'
			);
		} );

		it( 'should upgrade to a yearly plan when the button is clicked', () => {
			const wrapper = shallow( <PlanBillingPeriod { ...props } /> );
			wrapper.find( 'Button' ).simulate( 'click' );
			expect( planItem ).toHaveBeenCalledWith( 'jetpack_premium' );
			expect( addItem ).toHaveBeenCalled();
			expect( page ).toHaveBeenCalledWith( '/checkout/site.com' );
		} );

		describe( 'a disconnected site', () => {
			test( 'should display a message instead of the upgrade button', () => {
				const site = null;
				const wrapper = shallow( <PlanBillingPeriod { ...props } site={ site } /> );
				expect( wrapper.find( 'Button' ) ).toHaveLength( 0 );
				expect( wrapper.find( 'FormSettingExplanation' ).last().shallow().text() ).toContain(
					'To manage your plan, please reconnect your site.'
				);
			} );
		} );
	} );

	describe( 'an annual plan', () => {
		beforeEach( () => moment.locale( 'en' ) );

		const annualPlanProps = {
			...props,
			purchase: {
				...props.purchase,
				productSlug: 'jetpack_personal',
			},
		};

		it( 'should display the current period', () => {
			const wrapper = shallow( <PlanBillingPeriod { ...annualPlanProps } /> );
			expect( wrapper.find( 'FormSettingExplanation' ).shallow().text() ).toEqual(
				'Billed yearly'
			);
		} );

		describe( 'when credit card is expiring', () => {
			it( 'should display a warning to the user', () => {
				const planExpiryDate = moment().add( 3, 'months' ).format();
				const cardExpiryDate = moment().add( 1, 'months' ).format( 'MM/YY' );
				const purchase = {
					...annualPlanProps.purchase,
					expiryDate: planExpiryDate,
					payment: {
						type: 'credit_card',
						creditCard: {
							expiryDate: cardExpiryDate,
						},
					},
				};
				const wrapper = shallow(
					<PlanBillingPeriod { ...annualPlanProps } purchase={ purchase } />
				);
				expect( wrapper.find( 'FormSettingExplanation' ).shallow().text() ).toEqual(
					'Billed yearly, credit card expiring soon'
				);
			} );
		} );
		describe( 'when plan is renewing', () => {
			it( 'should display a warning to the user', () => {
				const purchase = {
					...annualPlanProps.purchase,
					renewDate: moment( '2020-01-01' ).format(),
				};
				const wrapper = shallow(
					<PlanBillingPeriod { ...annualPlanProps } purchase={ purchase } />
				);
				expect( wrapper.find( 'FormSettingExplanation' ).shallow().text() ).toEqual(
					'Billed yearly, renews on January 1, 2020'
				);
			} );
		} );
		describe( 'when plan is expiring', () => {
			it( 'should display a warning to the user', () => {
				const purchase = {
					...annualPlanProps.purchase,
					expiryDate: moment( '2020-01-01' ).format(),
					expiryStatus: 'expiring',
				};
				const wrapper = shallow(
					<PlanBillingPeriod { ...annualPlanProps } purchase={ purchase } />
				);
				expect( wrapper.find( 'FormSettingExplanation' ).shallow().text() ).toEqual(
					'Billed yearly, expires on January 1, 2020'
				);
			} );
		} );
		describe( 'when plan is expired', () => {
			it( 'should display a warning to the user', () => {
				const purchase = {
					...annualPlanProps.purchase,
					expiryDate: moment().subtract( 1, 'month' ).format(),
					expiryStatus: 'expired',
				};
				const wrapper = shallow(
					<PlanBillingPeriod { ...annualPlanProps } purchase={ purchase } />
				);
				expect( wrapper.find( 'FormSettingExplanation' ).shallow().text() ).toEqual(
					'Billed yearly, expired a month ago'
				);
			} );
		} );
	} );
} );
