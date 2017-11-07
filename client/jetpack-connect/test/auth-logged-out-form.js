/**
 * @format
 * @jest-environment jsdom
 */
/**
 * External dependencies
 */
import { shallow } from 'enzyme';
import { identity, noop } from 'lodash';
import React from 'react';

/**
 * Internal dependencies
 */
import { LOGGED_OUT_PROPS } from './lib/authorize-form';
import { LoggedOutFormTestComponent as LoggedOutForm } from '../auth-logged-out-form';

describe( 'LoggedOutForm', () => {
	test( 'should render', () => {
		const wrapper = shallow(
			<LoggedOutForm
				createAccount={ noop }
				jetpackConnectAuthorize={ LOGGED_OUT_PROPS.jetpackConnectAuthorize }
				recordTracksEvent={ noop }
				translate={ identity }
			/>
		);

		expect( wrapper ).toMatchSnapshot();
	} );
} );
