/**
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import { shallow } from 'enzyme';
import { identity, noop } from 'lodash';
import React from 'react';

/**
 * Internal dependencies
 */
import { CreditCardForm } from '../';
import { getParamsForApi } from '../helpers';
import CreditCardFormFields from 'calypso/components/credit-card-form-fields';

jest.mock( '@automattic/calypso-stripe', () => ( {
	useStripe: () => ( {
		stripe: {},
		stripeConfiguration: {},
		setStripeError: () => {},
		isStripeLoading: false,
		stripeLoadingError: {},
	} ),
} ) );

describe( 'Credit Card Form', () => {
	const defaultProps = {
		translate: identity,
		countriesList: [],
		recordFormSubmitEvent: noop,
		successCallback: noop,
	};

	test( 'does not blow up with default props', () => {
		const wrapper = shallow( <CreditCardForm { ...defaultProps } /> );
		expect( wrapper ).toHaveLength( 1 );
	} );

	test( 'renders CreditCardFormFields', () => {
		const wrapper = shallow( <CreditCardForm { ...defaultProps } /> );
		expect( wrapper.find( CreditCardFormFields ) ).toHaveLength( 1 );
	} );

	test( 'renders CreditCardFormFields with appropriate fields', () => {
		const wrapper = shallow( <CreditCardForm { ...defaultProps } /> );
		const child = wrapper.find( CreditCardFormFields );
		expect( child.prop( 'card' ) ).toEqual( {
			'address-1': '',
			'address-2': '',
			brand: '',
			city: '',
			country: '',
			cvv: '',
			document: '',
			'expiration-date': '',
			name: '',
			number: '',
			'phone-number': '',
			'postal-code': '',
			state: '',
			'street-number': '',
		} );
	} );

	test( 'has getErrorMessage return no errors for an empty field', () => {
		const initialValues = { number: '' };
		const props = { ...defaultProps, initialValues };
		const wrapper = shallow( <CreditCardForm { ...props } /> );
		const child = wrapper.find( CreditCardFormFields );
		const getErrorMessage = child.prop( 'getErrorMessage' );
		expect( getErrorMessage( 'number' ) ).toEqual( '' );
	} );

	describe( 'getParamsForApi()', () => {
		test( 'should return expected api params from form credit card values', () => {
			expect(
				getParamsForApi(
					{
						country: 'AU',
						'postal-code': '33333',
						'expiration-date': '02/2222',
						year: '2222',
						name: 'bob',
						document: '1111',
						'street-number': '12',
						'address-1': '12 Pleasant Crescent',
						city: 'city',
						state: 'state',
						'phone-number': '+31222222',
					},
					{}
				)
			).toEqual( {
				country: 'AU',
				zip: '33333',
				month: '02',
				year: '2222',
				name: 'bob',
				document: '1111',
				street_number: '12',
				address_1: '12 Pleasant Crescent',
				address_2: undefined,
				city: 'city',
				state: 'state',
				phone_number: '+31222222',
				paygate_token: {},
				payment_partner: '',
			} );
		} );
	} );
} );
