/**
 * External dependencies
 */
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import jetpackSSO from '../jetpack-sso';
import {
	JETPACK_CONNECT_SSO_AUTHORIZE_ERROR,
	JETPACK_CONNECT_SSO_AUTHORIZE_REQUEST,
	JETPACK_CONNECT_SSO_AUTHORIZE_SUCCESS,
	JETPACK_CONNECT_SSO_VALIDATION_ERROR,
	JETPACK_CONNECT_SSO_VALIDATION_REQUEST,
	JETPACK_CONNECT_SSO_VALIDATION_SUCCESS,
} from 'state/jetpack-connect/action-types';

const successfulSSOValidation = {
	type: JETPACK_CONNECT_SSO_VALIDATION_SUCCESS,
	success: true,
	blogDetails: {
		domain: 'example.wordpress.com',
		title: 'My BBQ Site',
		icon: {
			img: '',
			ico: '',
		},
		URL: 'https://example.wordpress.com',
		admin_url: 'https://example.wordpress.com/wp-admin',
	},
	sharedDetails: {
		ID: 0,
		login: 'bbquser',
		email: 'ieatbbq@example.wordpress.com',
		url: 'https://example.wordpress.com',
		first_name: 'Lou',
		last_name: 'Bucket',
		display_name: 'bestbbqtester',
		description: 'I like BBQ, a lot.',
		two_step_enabled: 0,
		external_user_id: 1,
	},
};

const falseSSOValidation = Object.assign( successfulSSOValidation, { success: false } );

describe( '#jetpackSSO()', () => {
	test( 'should default to an empty object', () => {
		const state = jetpackSSO( undefined, {} );
		expect( state ).toEqual( {} );
	} );

	test( 'should set isValidating to true when validating', () => {
		const state = jetpackSSO( undefined, {
			type: JETPACK_CONNECT_SSO_VALIDATION_REQUEST,
		} );

		expect( state ).toHaveProperty( 'isValidating', true );
	} );

	test( 'should set isAuthorizing to true when authorizing', () => {
		const state = jetpackSSO( undefined, {
			type: JETPACK_CONNECT_SSO_AUTHORIZE_REQUEST,
		} );

		expect( state ).toHaveProperty( 'isAuthorizing', true );
	} );

	test( 'should set isValidating to false after validation', () => {
		const actions = [
			successfulSSOValidation,
			{
				type: JETPACK_CONNECT_SSO_VALIDATION_ERROR,
				error: {
					statusCode: 400,
				},
			},
		];

		actions.forEach( ( action ) => {
			const state = jetpackSSO( undefined, action );
			expect( state ).toHaveProperty( 'isValidating', false );
		} );
	} );

	test( 'should store boolean nonceValid after validation', () => {
		const actions = [ successfulSSOValidation, falseSSOValidation ];

		actions.forEach( ( action ) => {
			const originalAction = deepFreeze( action );
			const state = jetpackSSO( undefined, originalAction );
			expect( state ).toHaveProperty( 'nonceValid', originalAction.success );
		} );
	} );

	test( 'should store blog details after validation', () => {
		const successState = jetpackSSO( undefined, successfulSSOValidation );
		expect( successState ).toMatchObject( { blogDetails: successfulSSOValidation.blogDetails } );
	} );

	test( 'should store shared details after validation', () => {
		const successState = jetpackSSO( undefined, successfulSSOValidation );
		expect( successState ).toMatchObject( {
			sharedDetails: successfulSSOValidation.sharedDetails,
		} );
	} );

	test( 'should set isAuthorizing to false after authorization', () => {
		const actions = [
			{
				type: JETPACK_CONNECT_SSO_AUTHORIZE_SUCCESS,
				ssoUrl: 'http://example.wordpress.com',
				siteUrl: 'http://example.wordpress.com',
			},
			{
				type: JETPACK_CONNECT_SSO_AUTHORIZE_ERROR,
				error: {
					statusCode: 400,
				},
			},
		];

		actions.forEach( ( action ) => {
			const state = jetpackSSO( undefined, action );
			expect( state ).toHaveProperty( 'isAuthorizing', false );
		} );
	} );

	test( 'should store sso_url after authorization', () => {
		const action = deepFreeze( {
			type: JETPACK_CONNECT_SSO_AUTHORIZE_SUCCESS,
			ssoUrl: 'http://example.wordpress.com',
			siteUrl: 'http://example.wordpress.com',
		} );

		const state = jetpackSSO( undefined, action );

		expect( state ).toHaveProperty( 'ssoUrl', action.ssoUrl );
	} );
} );
