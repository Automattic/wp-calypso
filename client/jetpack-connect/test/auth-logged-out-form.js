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
import LocaleSuggestions from 'components/locale-suggestions';
import {
	JETPACK_CONNECT_AUTHORIZE_LOGGED_OUT,
	JETPACK_CONNECT_AUTH_QUERY_LOGGED_OUT,
} from './lib/authorize-form';
import { LoggedOutFormTestComponent as LoggedOutForm } from '../auth-logged-out-form';

describe( 'LoggedOutForm', () => {
	test( 'should render', () => {
		const wrapper = shallow(
			<LoggedOutForm
				authorizationData={ JETPACK_CONNECT_AUTHORIZE_LOGGED_OUT }
				authQuery={ JETPACK_CONNECT_AUTH_QUERY_LOGGED_OUT }
				createAccount={ noop }
				recordTracksEvent={ noop }
				translate={ identity }
			/>
		);

		expect( wrapper ).toMatchSnapshot();
	} );

	test( 'should render with locale suggestions', () => {
		const wrapper = shallow(
			<LoggedOutForm
				authorizationData={ {
					...JETPACK_CONNECT_AUTHORIZE_LOGGED_OUT,
					locale: 'es',
				} }
				authQuery={ JETPACK_CONNECT_AUTH_QUERY_LOGGED_OUT }
				createAccount={ noop }
				locale="es"
				path="/jetpack/connect/authorize/es"
				recordTracksEvent={ noop }
				translate={ identity }
			/>
		);

		expect( wrapper ).toMatchSnapshot();
		expect( wrapper.find( LocaleSuggestions ) ).toHaveLength( 1 );
	} );
} );
