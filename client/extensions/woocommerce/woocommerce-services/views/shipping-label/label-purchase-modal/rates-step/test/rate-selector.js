/**
 * External dependencies
 */
import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import { identity, noop } from 'lodash';

/**
 * Internal dependencies
 */
import { RateSelector } from '../rate-selector';
import Dropdown from 'woocommerce/woocommerce-services/components/dropdown';
import FieldError from 'woocommerce/woocommerce-services/components/field-error';

/*
 * Useful data for testing
 */
const package_rate = {
	shipment_id: 'abcdef',
	rates: [ {
		title: 'USPS - Priority Mail translated',
		rate_id: 'rate_123',
		carrier_id: 'usps',
		rate: 2.87,
		service_id: 'priority',
	} ],
};

const props = {
	translate: identity,
	id: 'rates',
	packageId: 'weight_0_individual',
	packageName: 'Package Name',
	updateRate: noop,
	selectedRate: '',
	errors: {},
};

describe( '<RateSelector />', () => {
	describe( 'Rates only, no errors', () => {
		const wrapper = shallow(
			<RateSelector
				{ ...props }
				packageRates={ [ package_rate ] }
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
			<RateSelector
				{ ...props }
				packageRates={ [] }
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
		it( 'should display extra heading for package title', () => {
			expect( wrapper.find( '.rates-step__package-heading' ).text() ).to.equal( props.packageName );
		} );
	} );

	describe( 'Both rates and errors', () => {
		const wrapper = shallow(
			<RateSelector
				{ ...props }
				packageRates={ [ package_rate ] }
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
