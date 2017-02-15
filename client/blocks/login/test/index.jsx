/**
 * External dependencies
 */
import { expect } from 'chai';
import { noop } from 'lodash';
import React from 'react';
import { shallow } from 'enzyme';

/**
 * Internal dependencies
 */
import useFakeDom from 'test/helpers/use-fake-dom';
import FormTextInput from 'components/forms/form-text-input';
import FormsButton from 'components/forms/form-button';

describe( 'Login', function() {
	let Login;

	useFakeDom();

	before( () => {
		Login = require( 'blocks/login' ).Login;
	} );

	context( 'component rendering', () => {
		it( 'displays a login form', () => {
			const wrapper = shallow(
				<Login translate={ noop } />
			);
			expect( wrapper.find( FormTextInput ).length ).to.equal( 1 );
			expect( wrapper.find( 'input[type="password"]' ).length ).to.equal( 1 );
			expect( wrapper.find( FormsButton ).length ).to.equal( 1 );
		} );

		it( 'shows the header text', () => {
			const wrapper = shallow(
				<Login
					translate={ noop }
					title={ 'Sign in to connect to WordPress.com' }
					legalText={ 'By connecting, you agree to share details…' } />
			);
			expect( wrapper.find( '.login__form-header' ).text() ).to.contain( 'Sign in to connect to WordPress.com' );
		} );

		it( 'shows the legal text', () => {
			const wrapper = shallow(
				<Login
					translate={ noop }
					title={ 'Sign in to connect to WordPress.com' }
					legalText={ 'By connecting, you agree to share details…' } />
			);
			expect( wrapper.find( '.login__form-action-legal' ).text() ).to.contain( 'By connecting, you agree to share details…' );
		} );
	} );
} );
