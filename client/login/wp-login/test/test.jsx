/**
 * External Dependencies
 */
import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import { identity } from 'lodash';

/**
 * Internal Dependencies
 */
import useFakeDom from 'test/helpers/use-fake-dom';

describe( 'Login', () => {
	let Login;

	useFakeDom();

	before( () => {
		Login = require( '../index.jsx' ).Login;
	} );

	describe( 'footerLinks', () => {
		it( 'should have a "Back to WordPress.com" link', () => {
			const login = shallow( <Login queryArguments={ { redirect_to: '' } } translate={ identity } /> );

			expect( login.find( '.wp-login__footer > a' ).contains( 'Back to WordPress.com' ) ).to.equal( true );
		} );
	} );
} );
