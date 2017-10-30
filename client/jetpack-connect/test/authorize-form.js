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
import LoggedOutForm from '../auth-logged-out-form';
import { LOGGED_OUT_PROPS } from './lib/authorize-form';

describe( 'AuthorizeForm', () => {
	test( 'should render LoggedOutForm when logged out', () => {
		const wrapper = shallow( <AuthorizeForm { ...LOGGED_OUT_PROPS } /> );

		expect( wrapper ).toMatchSnapshot();
		expect( wrapper.find( LoggedOutForm ) ).toHaveLength( 1 );
	} );
} );
