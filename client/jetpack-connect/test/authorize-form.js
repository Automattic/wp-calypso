/**
 * @format
 * @jest-environment jsdom
 */
/**
 * External dependencies
 */
import { shallow } from 'enzyme';
import React from 'react';

/**
 * Internal dependencies
 */
import { JetpackConnectAuthorizeFormTestComponent as AuthorizeForm } from '../authorize-form';
import LoggedInForm from '../auth-logged-in-form';
import LoggedOutForm from '../auth-logged-out-form';
import { LOGGED_IN_PROPS, LOGGED_OUT_PROPS } from './lib/authorize-form';

describe( 'AuthorizeForm', () => {
	test( 'should render LoggedOutForm when logged out', () => {
		const wrapper = shallow( <AuthorizeForm { ...LOGGED_OUT_PROPS } /> );

		expect( wrapper ).toMatchSnapshot();
		expect( wrapper.find( LoggedOutForm ) ).toHaveLength( 1 );
	} );

	test( 'should render LoggedInForm when logged in', () => {
		const wrapper = shallow( <AuthorizeForm { ...LOGGED_IN_PROPS } /> );

		expect( wrapper ).toMatchSnapshot();
		expect( wrapper.find( LoggedInForm ) ).toHaveLength( 1 );
	} );
} );
