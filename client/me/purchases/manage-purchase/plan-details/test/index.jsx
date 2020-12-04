/**
 * External dependencies
 */
import { shallow } from 'enzyme';
import React from 'react';
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { PurchasePlanDetails } from '../index';
import PlanBillingPeriod from '../billing-period';

const props = {
	purchaseId: 123,
	isPlaceholder: false,
	purchase: {
		// Including only the properties that are used by this component
		id: 123,
		siteId: 123,
		productName: 'Jetpack Personal',
		productSlug: 'jetpack_premium_monthly',
		expiryStatus: 'active',
	},
	hasLoadedSites: true,
	hasLoadedUserPurchasesFromServer: true,
	pluginList: [
		{
			slug: 'vaultpress',
			name: 'vaultpress',
			key: 'abcdef',
			status: 'wait',
			error: null,
		},
		{ slug: 'akismet', name: 'akismet', key: 'abcdef', status: 'wait', error: null },
	],
	site: {
		ID: 123,
		name: 'Site Name',
	},
	siteId: 123,
	translate,
};

describe( 'PurchasePlanDetails', () => {
	describe( 'a jetpack plan', () => {
		it( 'should render the plugin data', () => {
			const wrapper = shallow( <PurchasePlanDetails { ...props } /> );
			expect( wrapper.find( '#plugin-vaultpress' ) ).toHaveLength( 1 );
			expect( wrapper.find( '#plugin-akismet' ) ).toHaveLength( 1 );
		} );

		describe( 'a partner purchase', () => {
			it( 'should not render the PlanBillingPeriod', () => {
				const purchase = {
					...props.purchase,
					partnerName: 'partner',
				};
				const wrapper = shallow( <PurchasePlanDetails { ...props } purchase={ purchase } /> );
				const planBillingPeriod = wrapper.find( PlanBillingPeriod );
				expect( planBillingPeriod ).toHaveLength( 0 );
			} );
		} );

		describe( 'not a partner purchase', () => {
			it( 'should render the PlanBillingPeriod', () => {
				const wrapper = shallow( <PurchasePlanDetails { ...props } /> );
				const planBillingPeriod = wrapper.find( PlanBillingPeriod );
				expect( planBillingPeriod ).toHaveLength( 1 );
				expect( planBillingPeriod.props() ).toMatchObject( {
					site: props.site,
					purchase: props.purchase,
				} );
			} );
		} );
	} );

	describe( 'is loading data', () => {
		it( 'should render the placeholder', () => {
			const hasLoadedSites = false;
			const wrapper = shallow(
				<PurchasePlanDetails { ...props } hasLoadedSites={ hasLoadedSites } />
			);
			expect( wrapper.find( '.is-placeholder' ) ).toHaveLength( 1 );
		} );
	} );

	describe( 'not a jetpack plan', () => {
		it( 'should return null', () => {
			const purchase = {
				...props.purchase,
				productSlug: 'business-bundle',
			};
			const wrapper = shallow( <PurchasePlanDetails { ...props } purchase={ purchase } /> );
			expect( wrapper.isEmptyRender() ).toEqual( true );
		} );
	} );

	describe( 'expired plan', () => {
		it( 'should return null', () => {
			const purchase = {
				...props.purchase,
				expiryStatus: 'expired',
			};
			const wrapper = shallow( <PurchasePlanDetails { ...props } purchase={ purchase } /> );
			expect( wrapper.isEmptyRender() ).toEqual( true );
		} );
	} );
} );
