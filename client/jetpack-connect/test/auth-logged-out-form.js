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
import { LOGGED_OUT_PROPS } from './lib/authorize-form';
import { LoggedOutFormTestComponent as LoggedOutForm } from '../auth-logged-out-form';

describe( 'LoggedOutForm', () => {
	test( 'should render', () => {
		const wrapper = shallow(
			<LoggedOutForm
				authorizationData={ LOGGED_OUT_PROPS.jetpackConnectAuthorize }
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
					...LOGGED_OUT_PROPS.jetpackConnectAuthorize,
					locale: 'es',
				} }
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
