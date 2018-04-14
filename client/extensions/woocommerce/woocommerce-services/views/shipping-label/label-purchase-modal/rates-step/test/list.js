/**
 * External dependencies
 */
import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import { identity } from 'lodash';

/**
 * Internal dependencies
 */
import { ShippingRates } from '../list';
import RateSelector from '../rate-selector';

/*
 * Useful data for testing
 */
const allPackages = {
	small_flat_box: {
		inner_dimensions: '8.63 x 5.38 x 1.63',
		outer_dimensions: '8.63 x 5.38 x 1.63',
		id: 'small_flat_box',
		name: 'Small Flat Rate Box',
		dimensions: [ {
			inner: '8.63 x 5.38: x 1.63',
			outer: '8.63 x 5.38 x 1.63',
		} ],
		box_weight: 0,
		max_weight: 70,
		is_letter: false,
		is_flat_rate: true,
		group_id: 'pri_flat_boxes',
	},
	medium_flat_box_top: {
		inner_dimensions: '11 x 8.5 x 5.5',
		outer_dimensions: '11.25 x 8.75 x 6',
		id: 'medium_flat_box_top',
		name: 'Medium Flat Rate Box 1, Top Loading',
		dimensions: [ {
			inner: '11 x 8.5 x 5.5',
			outer: '11.25 x 8.75 x 6',
		} ],
		box_weight: 0,
		max_weight: 70,
		is_letter: false,
		is_flat_rate: true,
		group_id: 'pri_flat_boxes',
	},
};

const selectedPackage_1 = {
	weight_0_individual: {
		id: 'weight_0_individual',
		box_id: 'individual',
		length: 1,
		width: 2,
		height: 3,
		weight: 1,
		items: [ {
			product_id: 1,
			length: 1,
			width: 2,
			height: 3,
			weight: 1,
			quantity: 1,
			name: '#1 - Package 1 Name',
			url: 'http://example.com/wp-admin/post.php?post=1&action=edit',
		} ],
		service_id: 'pri',
	},
};

const selectedPackage_2 = {
	weight_1_individual: {
		id: 'weight_1_individual',
		box_id: 'individual',
		length: 2,
		width: 2,
		height: 1,
		weight: 1,
		items: [ {
			product_id: 2,
			length: 2,
			width: 2,
			height: 1,
			weight: 1,
			quantity: 1,
			name: '#2 - Package 2 Name',
			url: 'http://example.com/wp-admin/post.php?post=2&action=edit',
		} ],
		service_id: 'pri',
	},
};

const props = {
	translate: identity,
	id: 'rates',
	shouldShowRateNotice: false,
	allPackages: allPackages,
};

const singlePackageProps = {
	...props,
	selectedPackages: selectedPackage_1,
};

const multiPackageProps = {
	...props,
	selectedPackages: { ...selectedPackage_1, ...selectedPackage_2 },
};

describe( '<ShippingRates />', () => {
	it( 'should display selector with no name for single package', () => {
		const wrapper = shallow( <ShippingRates { ...singlePackageProps } /> );
		const rateSelector = wrapper.find( RateSelector );
		expect( rateSelector ).to.have.length( 1 );
		expect( rateSelector.prop( 'packageName' ) ).to.be.null;
	} );

	it( 'should display selectors with names for multiple packages', () => {
		const wrapper = shallow( <ShippingRates { ...multiPackageProps } /> );
		const rateSelector = wrapper.find( RateSelector );
		expect( rateSelector ).to.have.length( 2 );
		expect( rateSelector.at( 0 ).prop( 'packageName' ) ).to.equal( '#1 - Package 1 Name' );
		expect( rateSelector.at( 1 ).prop( 'packageName' ) ).to.equal( '#2 - Package 2 Name' );
	} );
} );
