/**
 * External dependencies
 */
import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import { noop, identity } from 'lodash';

/**
 * Internal dependencies
 */
import { ShippingRates } from '../list';
import Dropdown from 'woocommerce/woocommerce-services/components/dropdown';
import FieldError from 'woocommerce/woocommerce-services/components/field-error';

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

const package_1_rate = {
	shipment_id: 'abcdef',
	rates: [ {
		title: 'USPS - Priority Mail translated',
		rate_id: 'rate_123',
		carrier_id: 'usps',
		rate: 2.87,
		service_id: 'priority',
	} ],
};

const package_1_error = {
	errors: [ 'There was a fedex error!' ],
};

const package_2_rate = {
	shipment_id: 'abcdef',
	rates: [ {
		title: 'USPS - Priority Mail translated',
		rate_id: 'rate_123',
		carrier_id: 'usps',
		rate: 2.87,
		service_id: 'priority',
	} ],
};

const package_2_error = {
	errors: [ 'There was a fedex error!' ],
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

const server_error_1 = {
	weight_0_individual: [ 'There was a fedex error!' ],
};

const server_error_2 = {
	weight_1_individual: [ 'There was a fedex error!' ],
};

const form_error_1 = {
	weight_0_individual: 'Please choose a rate 1',
};

const form_error_2 = {
	weight_1_individual: 'Please choose a rate 2',
};

const props = {
	id: 'rates',
	updateRate: noop,
	currencySymbol: '$',
	showRateNotice: false,
	allPackages: allPackages,
	availableRates: {},
	errors: {},
};

const singlePackageProps = Object.assign(
	{},
	props,
	{
		selectedRates: {
			weight_0_individual: '',
		},
		selectedPackages: selectedPackage_1,
	}
);

const multiPackageProps = Object.assign(
	{},
	props,
	{
		selectedRates: {
			weight_0_individual: '',
			weight_1_individual: '',
		},
		selectedPackages: Object.assign(
			{},
			selectedPackage_1,
			selectedPackage_2
		),
		availableRates: {
			weight_0_individual: Object.assign( {}, package_1_rate, package_1_error ),
			weight_1_individual: Object.assign( {}, package_2_rate, package_2_error ),
		},
		errors: {
			server: Object.assign(
				{},
				server_error_1,
				server_error_2
			),
			form: Object.assign(
				{},
				form_error_1,
				form_error_2,
			),
		},
	},
);

describe( '<ShippingRates />', () => {
	it( 'handles empty available rates', () => {
		const wrapper = shallow(
			<ShippingRates
				translate={ identity }
				{ ...singlePackageProps }
				availableRates={ {} }
			/>
		);
		expect( wrapper ).to.have.length( 1 );
	} );

	describe( 'Individual package', () => {
		describe( 'Rates only, no errors', () => {
			const wrapper = shallow(
				<ShippingRates
					translate={ identity }
					{ ...singlePackageProps }
					availableRates={ {
						weight_0_individual: package_1_rate,
					} }
					selectedRates={ {
						weight_0_individual: '',
					} }
					errors={ {
						server: {},
						form: {},
					} }
				/>
			);
			it( 'should display rates dropdown', () => {
				expect( wrapper.find( Dropdown ) ).to.have.length( 1 );
			} );
			it( 'should not display any errors', () => {
				expect( wrapper.find( FieldError ) ).to.have.length( 0 );
			} );
			it( 'should not display extra heading for package title', () => {
				// the package title is displayed using the dropdown legend
				expect( wrapper.find( '.rates-step__package-heading' ) ).to.have.length( 0 );
			} );
		} );

		describe( 'Errors only, no rates', () => {
			const wrapper = shallow(
				<ShippingRates
					translate={ identity }
					{ ...singlePackageProps }
					availableRates={ {
						weight_0_individual: package_1_error,
					} }
					selectedRates={ {
						weight_0_individual: '',
					} }
					errors={ {
						server: {
							weight_0_individual: [ 'There was an error!' ],
						},
						form: {
							weight_0_individual: null,
						},
					} }
				/>
			);
			it( 'should not display rates dropdown', () => {
				expect( wrapper.find( Dropdown ) ).to.have.length( 0 );
			} );
			it( 'should display error', () => {
				const errorWrapper = wrapper.find( FieldError );
				expect( errorWrapper ).to.have.length( 1 );
				expect( errorWrapper.prop( 'text' ) ).to.equal( 'There was an error!' );
			} );
			it( 'should not display extra heading for package title', () => {
				// the package title is displayed using the dropdown legend
				expect( wrapper.find( '.rates-step__package-heading' ) ).to.have.length( 0 );
			} );
		} );

		describe( 'Both rates and errors', () => {
			const wrapper = shallow(
				<ShippingRates
					translate={ identity }
					{ ...singlePackageProps }
					availableRates={ {
						weight_0_individual: Object.assign( {}, package_1_rate, package_1_error ),
					} }
					selectedRates={ {
						weight_0_individual: '',
					} }
					errors={ {
						server: {
							weight_0_individual: [ 'There was an error!' ],
						},
						form: {
							weight_0_individual: null,
						},
					} }
				/>
			);
			it( 'should display rates drop down', () => {
				expect( wrapper.find( Dropdown ) ).to.have.length( 1 );
			} );
			it( 'should display error', () => {
				expect( wrapper.find( FieldError ) ).to.have.length( 1 );
			} );
			it( 'should not display extra heading for package title', () => {
				// the package title is displayed using the dropdown legend
				expect( wrapper.find( '.rates-step__package-heading' ) ).to.have.length( 0 );
			} );
		} );
	} );

	describe( 'Multiple packages', () => {
		describe( 'Rates only for all packages', () => {
			const wrapper = shallow(
				<ShippingRates
					translate={ identity }
					{ ...multiPackageProps }
					availableRates={ {
						weight_0_individual: package_1_rate,
						weight_1_individual: package_2_rate,
					} }
					errors={ {} }
				/>
			);
			it( 'should display dropdown for each package', () => {
				expect( wrapper.find( Dropdown ) ).to.have.length( 2 );
			} );
			it( 'should not display any errors', () => {
				expect( wrapper.find( FieldError ) ).to.have.length( 0 );
			} );
			it( 'should not display extra heading for package title', () => {
				// the package title is displayed using the dropdown legend
				expect( wrapper.find( '.rates-step__package-heading' ) ).to.have.length( 0 );
			} );
		} );

		describe( 'Errors only for all packages', () => {
			const wrapper = shallow(
				<ShippingRates
					translate={ identity }
					{ ...multiPackageProps }
					availableRates={ {
						weight_0_individual: package_1_error,
						weight_1_individual: package_2_error,
					} }
				/>
			);
			it( 'should not display any dropdowns', () => {
				expect( wrapper.find( Dropdown ) ).to.have.length( 0 );
			} );
			it( 'should display error for each package', () => {
				expect( wrapper.find( FieldError ) ).to.have.length( 2 );
			} );
			it( 'should display extra heading for package title', () => {
				const packageNames = wrapper.find( '.rates-step__package-heading' ).map( node => node.text() );
				expect( packageNames ).to.have.length( 2 );
				expect( packageNames ).to.eql( [ '#1 - Package 1 Name', '#2 - Package 2 Name' ] );
			} );
		} );

		describe( 'Both rates and errors for all packages', () => {
			// this case is not expected to come from the server
			// but the client should be able to handle it without error just in case
			const wrapper = shallow(
				<ShippingRates
					translate={ identity }
					{ ...multiPackageProps }
				/>
			);
			it( 'should display dropdowns for each package', () => {
				expect( wrapper.find( Dropdown ) ).to.have.length( 2 );
			} );
			it( 'should display error for each package', () => {
				expect( wrapper.find( FieldError ) ).to.have.length( 2 );
			} );
			it( 'should not display extra heading for package title', () => {
				// the package title is displayed using the dropdown legend
				expect( wrapper.find( '.rates-step__package-heading' ) ).to.have.length( 0 );
			} );
		} );
	} );
} );
