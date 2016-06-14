/**
 * External dependencies
 */
import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';

/**
 * Internal dependencies
 */
import { BareComponent as PlanFeaturesHeader } from '../header';
import {
	PLAN_FREE,
	PLAN_PREMIUM
} from 'lib/plans/constants';

describe( 'plan-features-header', () => {
	it( 'should have component class', () => {
		const header = shallow(
			<PlanFeaturesHeader
				billingTimeFrame={ 'per month' }
				current={ false }
				planType={ PLAN_PREMIUM }
				popular={ true }
				rawPrice={ 8.25 }
				currencyCode={ 'USD' }
				title={ 'Premium' }
			/>
		);
		expect( header.hasClass( 'plan-features__header' ) ).to.equal( true );
	} );

	describe( 'prices display correctly', () => {
		it( 'free', () => {
			const header = shallow(
				<PlanFeaturesHeader
					billingTimeFrame={ 'for life' }
					current={ false }
					planType={ PLAN_FREE }
					popular={ true }
					rawPrice={ 0 }
					currencyCode={ 'USD' }
					title={ 'Premium' }
				/>
			);
			expect( header.find( '.plan-features__header-price' ).render().children().html() ).to.equal(
				'<sup class="plan-features__header-currency-symbol">$</sup>0'
			);
		} );
		it( 'USD', () => {
			const header = shallow(
				<PlanFeaturesHeader
					billingTimeFrame={ 'per month' }
					current={ false }
					planType={ PLAN_PREMIUM }
					popular={ true }
					rawPrice={ 8000.25 }
					currencyCode={ 'USD' }
					title={ 'Premium' }
				/>
			);
			expect( header.find( '.plan-features__header-price' ).render().children().html() ).to.equal(
				'<sup class="plan-features__header-currency-symbol">$</sup>8,000<sup class="plan-features__header-cents">.25</sup>'
			);
		} );
		it( 'AUD', () => {
			const header = shallow(
				<PlanFeaturesHeader
					billingTimeFrame={ 'per month' }
					current={ false }
					planType={ PLAN_PREMIUM }
					popular={ true }
					rawPrice={ 8000.25 }
					currencyCode={ 'AUD' }
					title={ 'Premium' }
				/>
			);
			expect( header.find( '.plan-features__header-price' ).render().children().html() ).to.equal(
				'<sup class="plan-features__header-currency-symbol">A$</sup>8,000<sup class="plan-features__header-cents">.25</sup>'
			);
		} );
		it( 'CAD', () => {
			const header = shallow(
				<PlanFeaturesHeader
					billingTimeFrame={ 'per month' }
					current={ false }
					planType={ PLAN_PREMIUM }
					popular={ true }
					rawPrice={ 8000.25 }
					currencyCode={ 'CAD' }
					title={ 'Premium' }
				/>
			);
			expect( header.find( '.plan-features__header-price' ).render().children().html() ).to.equal(
				'<sup class="plan-features__header-currency-symbol">C$</sup>8,000<sup class="plan-features__header-cents">.25</sup>'
			);
		} );
		it( 'EUR', () => {
			const header = shallow(
				<PlanFeaturesHeader
					billingTimeFrame={ 'per month' }
					current={ false }
					planType={ PLAN_PREMIUM }
					popular={ true }
					rawPrice={ 8000.25 }
					currencyCode={ 'EUR' }
					title={ 'Premium' }
				/>
			);
			expect( header.find( '.plan-features__header-price' ).render().children().html() ).to.equal(
				'8&#xA0;000<sup class="plan-features__header-cents">,25</sup><sup class="plan-features__header-currency-symbol">&#x20AC;</sup>'
			);
		} );
		it( 'GBP', () => {
			const header = shallow(
				<PlanFeaturesHeader
					billingTimeFrame={ 'per month' }
					current={ false }
					planType={ PLAN_PREMIUM }
					popular={ true }
					rawPrice={ 8000.25 }
					currencyCode={ 'GBP' }
					title={ 'Premium' }
				/>
			);
			expect( header.find( '.plan-features__header-price' ).render().children().html() ).to.equal(
				'<sup class="plan-features__header-currency-symbol">&#xA3;</sup>8,000<sup class="plan-features__header-cents">.25</sup>'
			);
		} );
		it( 'JPY', () => {
			const header = shallow(
				<PlanFeaturesHeader
					billingTimeFrame={ 'per month' }
					current={ false }
					planType={ PLAN_PREMIUM }
					popular={ true }
					rawPrice={ 8000.25 }
					currencyCode={ 'JPY' }
					title={ 'Premium' }
				/>
			);
			expect( header.find( '.plan-features__header-price' ).render().children().html() ).to.equal(
				'<sup class="plan-features__header-currency-symbol">&#xA5;</sup>8,000'
			);
		} );
	} );
} );
