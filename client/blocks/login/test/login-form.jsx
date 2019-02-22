/**
 * @format
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import { expect } from 'chai';
import { shallow } from 'enzyme';
import { noop } from 'lodash';
import React from 'react';

/**
 * Internal dependencies
 */
import FormsButton from 'components/forms/form-button';
import FormInputValidation from 'components/forms/form-input-validation';
import FormPasswordInput from 'components/forms/form-password-input';
import FormTextInput from 'components/forms/form-text-input';

describe( 'LoginForm', () => {
	let LoginForm;
	const mockProps = {
		fetchMagicLoginRequestEmail: jest.fn(),
		formUpdate: jest.fn(),
		getAuthAccountType: jest.fn(),
		hasAccountTypeLoaded: true,
		isLoggedIn: true,
		loginUser: jest.fn(),
		onSuccess: jest.fn(),
		resetAuthAccountType: jest.fn(),
	};

	beforeAll( () => {
		LoginForm = require( 'blocks/login/login-form' ).LoginForm;
	} );

	describe( 'component rendering', () => {
		test( 'displays a login form', () => {
			const wrapper = shallow(
				<LoginForm translate={ noop } { ...mockProps } socialAccountLink={ { isLinking: false } } />
			);
			expect( wrapper.find( FormTextInput ).length ).to.equal( 1 );
			expect( wrapper.find( FormPasswordInput ).length ).to.equal( 1 );
			expect( wrapper.find( FormsButton ).length ).to.equal( 1 );
		} );
	} );

	describe( 'dislpay username errors', () => {
		test( 'should display an error form when username is invalid', () => {
			const wrapper = shallow(
				<LoginForm translate={ noop } { ...mockProps } socialAccountLink={ { isLinking: false } } />
			);
			const spy = jest.spyOn( wrapper.instance(), 'validateUsernameOrEmail' );
			wrapper.find( FormTextInput ).simulate( 'change', { target: { value: 'helloworld/' } } );
			expect( wrapper.find( FormInputValidation ).length ).to.equal( 1 );
			expect( spy.mock.calls.length ).to.equal( 1 );
		} );

		test( 'should not display en error form when username is valid ', () => {
			const wrapper = shallow(
				<LoginForm translate={ noop } { ...mockProps } socialAccountLink={ { isLinking: false } } />
			);
			const spy = jest.spyOn( wrapper.instance(), 'validateUsernameOrEmail' );
			wrapper.find( FormTextInput ).simulate( 'change', { target: { value: 'helloworld' } } );
			expect( wrapper.find( FormInputValidation ).length ).to.equal( 0 );
			expect( spy.mock.calls.length ).to.equal( 1 );
		} );
	} );
} );
