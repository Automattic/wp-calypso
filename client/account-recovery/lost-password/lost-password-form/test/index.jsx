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

		expect( wrapper ).to.have.state( 'isSubmitting' ).to.be.false;
		expect( wrapper.find( '.lost-password-form__user-login-input' ).prop( 'disabled' ) ).to.not.be.ok;
		expect( wrapper.find( '.lost-password-form__submit-button' ).prop( 'disabled' ) ).to.be.ok;
	} );

	context( 'events', () => {
		useFakeDom();

		it( 'submit button shuold be disabled if user login is blank', function() {
			const wrapper = mount( <LostPasswordFormComponent className="test__test" /> );

			wrapper.find( '.lost-password-form__user-login-input' ).node.value = '';
			wrapper.find( '.lost-password-form__user-login-input' ).simulate( 'change' );
			expect( wrapper.find( '.lost-password-form__user-login-input' ).prop( 'disabled' ) ).to.not.be.ok;
			expect( wrapper.find( '.lost-password-form__submit-button' ).prop( 'disabled' ) ).to.be.ok;
		} );

		it( 'should be disabled when submit button clicked', function() {
			const wrapper = mount( <LostPasswordFormComponent className="test__test" /> );

			wrapper.find( '.lost-password-form__user-login-input' ).node.value = 'test';
			wrapper.find( '.lost-password-form__user-login-input' ).simulate( 'change' );
			wrapper.find( '.lost-password-form__submit-button' ).simulate( 'click' );

			expect( wrapper ).to.have.state( 'isSubmitting' ).to.be.true;
			expect( wrapper.find( '.lost-password-form__user-login-input' ).prop( 'disabled' ) ).to.be.ok;
			expect( wrapper.find( '.lost-password-form__submit-button' ).prop( 'disabled' ) ).to.be.ok;
		} );
	} );
} );
