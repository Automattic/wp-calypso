/**
 * External dependencies
 */
import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';

/**
 * Internal dependencies
 */
import PlanFeaturesPrice from '../price';

describe( 'plan-features-price', () => {
	it( 'should have component class', () => {
		const price = shallow(
			<PlanFeaturesPrice
				rawPrice={ 8.25 }
				currencyCode={ 'USD' }
			/>
		);
		expect( price.hasClass( 'plan-features__price' ) ).to.equal( true );
	} );

	describe( 'prices display correctly', () => {
		it( 'free', () => {
			const price = shallow(
				<PlanFeaturesPrice
					rawPrice={ 0 }
					currencyCode={ 'USD' }
				/>
			);
			expect( price.render().children().html() ).to.equal(
				'<sup class="plan-features__price-currency-symbol">$</sup>0'
			);
		} );
		it( 'USD', () => {
			const price = shallow(
				<PlanFeaturesPrice
					rawPrice={ 8000.25 }
					currencyCode={ 'USD' }
				/>
			);
			expect( price.render().children().html() ).to.equal(
				'<sup class="plan-features__price-currency-symbol">$</sup>8,000<sup class="plan-features__price-cents">.25</sup>'
			);
		} );
		it( 'AUD', () => {
			const price = shallow(
				<PlanFeaturesPrice
					rawPrice={ 8000.25 }
					currencyCode={ 'AUD' }
				/>
			);
			expect( price.render().children().html() ).to.equal(
				'<sup class="plan-features__price-currency-symbol">A$</sup>8,000<sup class="plan-features__price-cents">.25</sup>'
			);
		} );
		it( 'CAD', () => {
			const price = shallow(
				<PlanFeaturesPrice
					rawPrice={ 8000.25 }
					currencyCode={ 'CAD' }
				/>
			);
			expect( price.render().children().html() ).to.equal(
				'<sup class="plan-features__price-currency-symbol">C$</sup>8,000<sup class="plan-features__price-cents">.25</sup>'
			);
		} );
		it( 'EUR', () => {
			const price = shallow(
				<PlanFeaturesPrice
					rawPrice={ 8000.25 }
					currencyCode={ 'EUR' }
				/>
			);
			expect( price.render().children().html() ).to.equal(
				'8.000<sup class="plan-features__price-cents">,25</sup>&#xA0;<sup class="plan-features__price-currency-symbol">&#x20AC;</sup>'
			);
		} );
		it( 'GBP', () => {
			const price = shallow(
				<PlanFeaturesPrice
					rawPrice={ 8000.25 }
					currencyCode={ 'GBP' }
				/>
			);
			expect( price.render().children().html() ).to.equal(
				'<sup class="plan-features__price-currency-symbol">&#xA3;</sup>8,000<sup class="plan-features__price-cents">.25</sup>'
			);
		} );
		it( 'JPY', () => {
			const price = shallow(
				<PlanFeaturesPrice
					rawPrice={ 8000.25 }
					currencyCode={ 'JPY' }
				/>
			);
			expect( price.render().children().html() ).to.equal(
				'<sup class="plan-features__price-currency-symbol">&#xA5;</sup>8,000'
			);
		} );
	} );
} );
