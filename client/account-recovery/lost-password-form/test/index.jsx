/**
 * External dependencies
 */
import React from 'react';
import { expect } from 'chai';
import { shallow, mount } from 'enzyme';

/**
 * Internal dependencies
 */
import useFakeDom from 'test/helpers/use-fake-dom';
import { LostPasswordFormComponent } from '..';

describe( 'LostPassword', () => {
	it( 'should render as expected', () => {
		const wrapper = shallow( <LostPasswordFormComponent /> );

		expect( wrapper.find( '.lost-password-form__user-login-input' ).prop( 'disabled' ) ).to.not.be.ok;
		expect( wrapper.find( '.lost-password-form__submit-button' ).prop( 'disabled' ) ).to.be.ok;
	} );

	context( 'events', () => {
		useFakeDom();

		it( 'submit button should be disabled if user login is blank', function() {
			const wrapper = mount( <LostPasswordFormComponent className="test__test" /> );
			wrapper.setState( { userLoginFormValue: '' } );

			wrapper.find( '.lost-password-form__user-login-input' ).node.value = '';
			expect( wrapper.find( '.lost-password-form__user-login-input' ).prop( 'disabled' ) ).to.not.be.ok;
			expect( wrapper.find( '.lost-password-form__submit-button' ).prop( 'disabled' ) ).to.be.ok;
		} );

		it( 'should be disabled when isRequesting is true', function() {
			const wrapper = mount( <LostPasswordFormComponent className="test__test" isRequesting={ true } /> );

			expect( wrapper.find( '.lost-password-form__user-login-input' ).prop( 'disabled' ) ).to.be.ok;
			expect( wrapper.find( '.lost-password-form__submit-button' ).prop( 'disabled' ) ).to.be.ok;
		} );
	} );
} );
