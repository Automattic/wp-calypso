/**
 * @format
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import { expect } from 'chai';
import { shallow, mount } from 'enzyme';
import React from 'react';

/**
 * Internal dependencies
 */
import { LostPasswordFormComponent } from '..';

describe( 'LostPassword', () => {
	test( 'should render as expected', () => {
		const wrapper = shallow( <LostPasswordFormComponent /> );

		expect( wrapper.find( '.lost-password-form__user-login-input' ).prop( 'disabled' ) ).to.not.be
			.ok;
		expect( wrapper.find( '.lost-password-form__submit-button' ).prop( 'disabled' ) ).to.be.ok;
	} );

	describe( 'events', () => {
		test( 'submit button should be disabled if user login is blank', () => {
			const wrapper = mount( <LostPasswordFormComponent className="test__test" /> );
			wrapper.setState( { userLoginFormValue: '' } );

			expect(
				wrapper.find( '.form-text-input.lost-password-form__user-login-input' ).prop( 'disabled' )
			).to.not.be.ok;
			expect( wrapper.find( 'button.lost-password-form__submit-button' ).prop( 'disabled' ) ).to.be
				.ok;
		} );

		test( 'should be disabled when isRequesting is true', () => {
			const wrapper = mount(
				<LostPasswordFormComponent className="test__test" isRequesting={ true } />
			);

			expect(
				wrapper.find( '.form-text-input.lost-password-form__user-login-input' ).prop( 'disabled' )
			).to.be.ok;
			expect( wrapper.find( 'button.lost-password-form__submit-button' ).prop( 'disabled' ) ).to.be
				.ok;
		} );
	} );
} );
