/**
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import React from 'react';
import { identity } from 'lodash';
import { shallow } from 'enzyme';

/**
 * Internal dependencies
 */
import { AuthFormHeader } from '../auth-form-header';
import FormattedHeader from 'calypso/components/formatted-header';
import wooDnaConfig from '../woo-dna-config';

const CLIENT_ID = 98765;
const SITE_SLUG = 'an.example.site';
const DEFAULT_PROPS = {
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
	translate: identity,
};

describe( 'AuthFormHeader', () => {
	test( 'renders as expected', () => {
		const wrapper = shallow( <AuthFormHeader { ...DEFAULT_PROPS } /> );

		expect( wrapper ).toMatchSnapshot();
	} );

	test( 'should render WC Payments specific sub header copy', () => {
		const authQuery = {
			...DEFAULT_PROPS.authQuery,
			from: 'woocommerce-payments',
			woodna_service_name: 'WooCommerce Payments',
		};
		const props = {
			...DEFAULT_PROPS,
			authQuery,
			wooDnaConfig: wooDnaConfig( authQuery ),
		};

		// Notice we have \xa0. This is needed when we compare translated text.
		// Please refer to https://stackoverflow.com/questions/54242039/intl-numberformat-space-character-does-not-match
		const expectedText =
			'Approve your connection. Your account will enable you to start using the features and benefits offered by WooCommerce\xa0Payments';
		const wrapper = shallow( <AuthFormHeader { ...props } /> )
			.find( FormattedHeader )
			.render();

		expect( wrapper.find( '.formatted-header__subtitle' ).text() ).toEqual( expectedText );
	} );
} );
