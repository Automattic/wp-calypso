/**
 * @format
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
import CreditCardForm from '../';

jest.mock( 'i18n-calypso', () => ( {
	localize: x => x,
} ) );

describe( 'Credit Card Form', () => {
	const defaultProps = {
		translate: identity,
		createCardToken: noop,
		recordFormSubmitEvent: noop,
		successCallback: noop,
	};

	test( 'does not blow up with default props', () => {
		const wrapper = shallow( <CreditCardForm { ...defaultProps } /> );
		expect( wrapper ).toHaveLength( 1 );
	} );

	describe( 'getParamsForApi()', () => {
		test( 'should return expected api params from form credit card values', () => {
			const wrapper = shallow( <CreditCardForm { ...defaultProps } /> );

			expect(
				wrapper.instance().getParamsForApi(
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
				cardToken: {},
			} );
		} );
	} );
} );
