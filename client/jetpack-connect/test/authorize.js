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
import { JetpackAuthorize } from '../authorize';

const CLIENT_ID = 98765;
const SITE_SLUG = 'an.example.site';
const DEFAULT_PROPS = deepFreeze( {
	authAttempts: 0,
	authorizationData: {
		authorizeError: false,
		authorizeSuccess: false,
		clientId: CLIENT_ID,
		clientNotResponding: true,
		isAuthorizing: false,
		timestamp: 1509368045859,
		userAlreadyConnected: false,
	},
	authorize: noop,
	authQuery: {
		authApproved: false,
		blogname: 'Example Blog',
		clientId: CLIENT_ID,
		closeWindowAfterLogin: false,
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
	calypsoStartedConnection: false,
	hasExpiredSecretError: false,
	hasXmlrpcError: false,
	isAlreadyOnSitesList: false,
	isFetchingAuthorizationSite: false,
	isFetchingSites: false,
	recordTracksEvent: noop,
	retryAuth: noop,
	siteSlug: SITE_SLUG,
	translate: identity,
	user: {
		display_name: "A User's Name",
	},
	userAlreadyConnected: false,
} );

jest.mock( 'config', () => {
	const mock = () => 'development';
	mock.isEnabled = jest.fn( () => true );
	return mock;
} );

describe( 'JetpackAuthorize', () => {
	test( 'renders as expected', () => {
		const wrapper = shallow( <JetpackAuthorize { ...DEFAULT_PROPS } /> );

		expect( wrapper ).toMatchSnapshot();
	} );

	describe( 'isSso', () => {
		const isSso = new JetpackAuthorize().isSso;
		const queryDataSiteId = 12349876;

		test( 'returns true for valid SSO', () => {
			document.cookie = `jetpack_sso_approved=${ queryDataSiteId };`;
			const props = {
				authQuery: {
					from: 'sso',
					clientId: queryDataSiteId,
				},
			};
			expect( isSso( props ) ).toBe( true );
		} );

		test( 'returns false with non-sso from', () => {
			document.cookie = `jetpack_sso_approved=${ queryDataSiteId };`;
			const props = {
				authQuery: {
					from: 'elsewhere',
					clientId: queryDataSiteId,
				},
			};
			expect( isSso( props ) ).toBe( false );
		} );

		test( 'returns false without approved cookie', () => {
			document.cookie = 'jetpack_sso_approved=;';
			const props = {
				authQuery: {
					from: 'sso',
					clientId: queryDataSiteId,
				},
			};
			expect( isSso( props ) ).toBe( false );
		} );

		test( 'returns false with no cookie or queryDataSiteId', () => {
			document.cookie = 'jetpack_sso_approved=;';
			const props = {
				authQuery: {
					from: 'sso',
					clientId: null,
				},
			};
			expect( isSso( props ) ).toBe( false );
		} );
	} );

	describe( 'isWooRedirect', () => {
		const isWooRedirect = new JetpackAuthorize().isWooRedirect;

		test( 'should return true for woo services', () => {
			const props = { authQuery: { from: 'woocommerce-services-auto-authorize' } };
			expect( isWooRedirect( props ) ).toBe( true );
		} );

		test( 'should return true for old woo setup wizard', () => {
			const props = { authQuery: { from: 'woocommerce-setup-wizard' } };
			expect( isWooRedirect( props ) ).toBe( true );
		} );

		test( 'should return true for new woo onboarding', () => {
			const props = { authQuery: { from: 'woocommerce-onboarding' } };
			expect( isWooRedirect( props ) ).toBe( true );
		} );

		test( 'returns false with non-woo from', () => {
			const props = { authQuery: { from: 'elsewhere' } };
			expect( isWooRedirect( props ) ).toBeFalsy();
		} );
	} );

	describe( 'shouldAutoAuthorize', () => {
		test( 'should return true for sso', () => {
			const renderableComponent = <JetpackAuthorize { ...DEFAULT_PROPS } />;
			const component = shallow( renderableComponent );
			component.instance().isSso = () => true;
			const result = component.instance().shouldAutoAuthorize();

			expect( result ).toBe( true );
		} );

		test( 'should return true for woo services', () => {
			const renderableComponent = <JetpackAuthorize { ...DEFAULT_PROPS } />;
			const component = shallow( renderableComponent );
			component.setProps( {
				authQuery: {
					...DEFAULT_PROPS.authQuery,
					from: 'woocommerce-services-auto-authorize',
				},
			} );
			const result = component.instance().shouldAutoAuthorize();

			expect( result ).toBe( true );
		} );

		test( 'should return false for woocommerce onboarding', () => {
			const renderableComponent = <JetpackAuthorize { ...DEFAULT_PROPS } />;
			const component = shallow( renderableComponent );
			component.setProps( {
				authQuery: {
					...DEFAULT_PROPS.authQuery,
					from: 'woocommerce-onboarding',
				},
			} );
			const result = component.instance().shouldAutoAuthorize();

			expect( result ).toBe( false );
		} );

		test( 'should return true for the old woocommerc setup wizard', () => {
			const renderableComponent = <JetpackAuthorize { ...DEFAULT_PROPS } />;
			const component = shallow( renderableComponent );
			component.setProps( {
				authQuery: {
					...DEFAULT_PROPS.authQuery,
					from: 'woocommerce-setup-wizard',
				},
			} );
			const result = component.instance().shouldAutoAuthorize();

			expect( result ).toBe( true );
		} );
	} );
} );
