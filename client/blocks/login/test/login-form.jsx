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
import FormPasswordInput from 'components/forms/form-password-input';
import FormTextInput from 'components/forms/form-text-input';

describe( 'LoginForm', () => {
	let LoginForm;

	beforeAll( () => {
		LoginForm = require( 'blocks/login/login-form' ).LoginForm;
	} );

	describe( 'component rendering', () => {
		test( 'displays a login form', () => {
			const wrapper = shallow(
				<LoginForm translate={ noop } socialAccountLink={ { isLinking: false } } />
			);
			expect( wrapper.find( FormTextInput ).length ).to.equal( 1 );
			expect( wrapper.find( FormPasswordInput ).length ).to.equal( 1 );
			expect( wrapper.find( FormsButton ).length ).to.equal( 1 );
		} );
	} );
} );
