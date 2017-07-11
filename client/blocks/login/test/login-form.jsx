/**
 * @jest-environment jsdom
 */

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
import FormTextInput from 'components/forms/form-text-input';
import FormPasswordInput from 'components/forms/form-password-input';
import FormsButton from 'components/forms/form-button';

describe( 'LoginForm', function() {
	let LoginForm;

	before( () => {
		LoginForm = require( 'blocks/login/login-form' ).LoginForm;
	} );

	context( 'component rendering', () => {
		it( 'displays a login form', () => {
			const wrapper = shallow(
				<LoginForm translate={ noop } socialAccountLink={ { isLinking: false } } />
			);
			expect( wrapper.find( FormTextInput ).length ).to.equal( 1 );
			expect( wrapper.find( FormPasswordInput ).length ).to.equal( 1 );
			expect( wrapper.find( FormsButton ).length ).to.equal( 1 );
		} );
	} );
} );
