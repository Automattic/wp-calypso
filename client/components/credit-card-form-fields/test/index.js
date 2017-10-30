/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';
import { shallow } from 'enzyme';
import React from 'react';

/**
 * Internal dependencies
 */
import CreditCardFormFields from '../';

jest.mock( 'i18n-calypso', () => ( {
	localize: x => x,
} ) );

describe( 'CreditCardFormFields', () => {
	test( 'should have `CreditCardFormFields` class', () => {
		const wrapper = shallow( <CreditCardFormFields /> );
		expect( wrapper.find( '.credit-card-form-fields' ) ).to.have.length( 1 );
	} );
} );
