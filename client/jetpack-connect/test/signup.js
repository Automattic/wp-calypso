/**
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import deepFreeze from 'deep-freeze';
import React from 'react';
import { identity, noop } from 'lodash';
import { shallow } from 'enzyme';

/**
 * Internal dependencies
 */
import LocaleSuggestions from 'calypso/components/locale-suggestions';
import { JetpackSignup } from '../signup.js';

const CLIENT_ID = 98765;
const SITE_SLUG = 'an.example.site';
const DEFAULT_PROPS = deepFreeze( {
	authorizationData: {
		authorizeError: false,
		authorizeSuccess: false,
		clientId: CLIENT_ID,
		clientNotResponding: true,
		isAuthorizing: false,
		timestamp: 1509368045859,
		userAlreadyConnected: false,
	},
	authQuery: {
		authApproved: false,
		blogname: 'Example Blog',
		clientId: CLIENT_ID,
		from: 'banner-44-slide-1-dashboard',
		homeUrl: `http://${ SITE_SLUG }`,
		jpVersion: '5.4',
		nonce: 'fooBarNonce',
		redirectAfterAuth: `http://${ SITE_SLUG }/wp-admin/admin.php?page=jetpack`,
		redirectUri: `http://${ SITE_SLUG }/wp-admin/admin.php?page=jetpack&action=authorize&_wpnonce=fooBarNonce&redirect=http%3A%2F%2F${ SITE_SLUG }%2Fwp-admin%2Fadmin.php%3Fpage%3Djetpack`,
		scope: 'administrator:fooBarBaz',
		secret: 'fooBarSecret',
		site: `http://${ SITE_SLUG }`,
		siteIcon: '',
		siteUrl: `http://${ SITE_SLUG }`,
		state: '1',
		userEmail: `email@${ SITE_SLUG }`,
	},
	createAccount: noop,
	path: '/jetpack/connect/authorize',
	recordTracksEvent: noop,
	translate: identity,
} );

describe( 'JetpackSignup', () => {
	test( 'should render', () => {
		const wrapper = shallow( <JetpackSignup { ...DEFAULT_PROPS } /> );

		expect( wrapper ).toMatchSnapshot();
	} );

	test( 'should render with locale suggestions', () => {
		const wrapper = shallow(
			<JetpackSignup
				{ ...DEFAULT_PROPS }
				authorizationData={ {
					...DEFAULT_PROPS.authorizationData,
					locale: 'es',
				} }
				locale="es"
				path="/jetpack/connect/authorize/es"
			/>
		);

		expect( wrapper ).toMatchSnapshot();
		expect( wrapper.find( LocaleSuggestions ) ).toHaveLength( 1 );
	} );
} );
