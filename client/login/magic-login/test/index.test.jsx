/** @jest-environment jsdom */
import React from 'react';
import { getPartnerSignupTosElement } from 'calypso/lib/partner-branding';
import { getConnectionFlowFromRedirectTo, getMagicLoginInitialHeaders, MagicLogin } from '../index';

jest.mock( 'calypso/lib/partner-branding', () => ( {
	detectPartnerConfig: jest.fn(),
	getPartnerSignupTosElement: jest.fn(),
} ) );

describe( 'magic-login branding behavior', () => {
	const baseProps = {
		path: '/log-in/link',
		recordPageView: jest.fn(),
		recordTracksEvent: jest.fn(),
		locale: 'en',
		query: {},
		showCheckYourEmail: false,
		emailRequested: false,
		twoFactorNotificationSent: null,
		redirectToSanitized: '',
		translate: ( text ) => text,
		oauth2Client: null,
		isWooJPC: false,
		partnerConfig: null,
	};

	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'overrides heading for a branded partner flow', () => {
		const translate = jest.fn( ( text, options ) => {
			if ( options?.args?.partnerName ) {
				return `Log in to ${ options.args.partnerName }`;
			}

			return text;
		} );

		const { heading } = getMagicLoginInitialHeaders(
			{
				...baseProps,
				partnerConfig: {
					displayName: 'Woo',
				},
			},
			translate
		);

		expect( heading ).toBe( 'Log in to Woo' );
		expect( translate ).toHaveBeenCalledWith( 'Log in to %(partnerName)s', {
			args: {
				partnerName: 'Woo',
			},
		} );
	} );

	it( 'falls back to default heading when no partner config is present', () => {
		const translate = jest.fn( ( text ) => text );

		const { heading } = getMagicLoginInitialHeaders( baseProps, translate );

		expect( heading ).toBe( 'Email me a login link' );
	} );

	it( 'uses partner ToS when available', () => {
		const partnerTosElement = <span>Partner ToS</span>;
		getPartnerSignupTosElement.mockReturnValue( partnerTosElement );

		const instance = new MagicLogin( {
			...baseProps,
			partnerConfig: { id: 'woo', displayName: 'Woo' },
		} );

		expect( instance.renderTos() ).toBe( partnerTosElement );
	} );

	it( 'uses fallback ToS when partner ToS is unavailable', () => {
		getPartnerSignupTosElement.mockReturnValue( undefined );
		const translate = jest.fn( ( text ) => text );

		const instance = new MagicLogin( {
			...baseProps,
			translate,
		} );

		const tos = instance.renderTos();

		expect( tos ).toContain( 'By continuing you agree to our' );
		expect( translate ).toHaveBeenCalledWith(
			expect.stringContaining( 'By continuing you agree to our' ),
			expect.objectContaining( {
				components: expect.objectContaining( {
					privacyLink: expect.anything(),
					tosLink: expect.anything(),
				} ),
			} )
		);
	} );

	it( 'hides the app promo in check-your-email when partner branding is enabled', () => {
		const instance = new MagicLogin( {
			...baseProps,
			showCheckYourEmail: true,
			partnerConfig: { id: 'woo', displayName: 'Woo' },
		} );

		expect( instance.renderLinks() ).toBeNull();
	} );

	it( 'shows the app promo in check-your-email when partner branding is not enabled', () => {
		const instance = new MagicLogin( {
			...baseProps,
			showCheckYourEmail: true,
			partnerConfig: null,
		} );

		expect( instance.renderLinks() ).toEqual(
			expect.objectContaining( {
				props: expect.objectContaining( {
					campaign: 'calypso-login-link-check-email',
					className: 'magic-link-app-promo',
				} ),
			} )
		);
	} );
} );

describe( 'getConnectionFlowFromRedirectTo', () => {
	it( 'flags the connector flow and parses plugins when from=jetpack-connector', () => {
		const params = getConnectionFlowFromRedirectTo(
			'/jetpack/connect/authorize?from=jetpack-connector&plugins=jetpack,woocommerce'
		);

		expect( params ).toEqual( {
			isUnifiedConnectionFlow: true,
			connectorPlugins: [ 'jetpack', 'woocommerce' ],
		} );
	} );

	it.each( [
		'jetpack-onboarding',
		'jetpack_premium_analytics_onboarding',
		'delete_connection_owner_notice',
	] )( 'flags the connector flow and parses plugins for from=%s', ( from ) => {
		const params = getConnectionFlowFromRedirectTo(
			`/jetpack/connect/authorize?from=${ from }&plugins=jetpack-premium-analytics`
		);

		expect( params ).toEqual( {
			isUnifiedConnectionFlow: true,
			connectorPlugins: [ 'jetpack-premium-analytics' ],
		} );
	} );

	it.each( [ 'jetpack-onboarding-wizard', 'jetpack-newsletter', 'jetpack-x_y' ] )(
		'treats the legacy value %s as outside the unified flow',
		( from ) => {
			const params = getConnectionFlowFromRedirectTo(
				`/jetpack/connect/authorize?from=${ from }&plugins=jetpack`
			);

			expect( params ).toEqual( {
				isUnifiedConnectionFlow: false,
				connectorPlugins: [],
			} );
		}
	);

	it( 'does not flag the connector for unrelated from values and ignores plugins', () => {
		const params = getConnectionFlowFromRedirectTo(
			'/jetpack/connect/authorize?from=my-jetpack&plugins=jetpack,woocommerce'
		);

		expect( params.isUnifiedConnectionFlow ).toBe( false );
		expect( params.connectorPlugins ).toEqual( [] );
	} );

	it( 'falls back to currentQuery.from when redirect_to does not carry from', () => {
		const params = getConnectionFlowFromRedirectTo( '/jetpack/connect/authorize', {
			from: 'jetpack-connector',
			plugins: 'jetpack,woocommerce',
		} );

		expect( params.isUnifiedConnectionFlow ).toBe( true );
		expect( params.connectorPlugins ).toEqual( [ 'jetpack', 'woocommerce' ] );
	} );

	it( 'prefers redirect_to over currentQuery for from and plugins when both are present', () => {
		const params = getConnectionFlowFromRedirectTo(
			'/jetpack/connect/authorize?from=jetpack-connector&plugins=jetpack',
			{ from: 'my-jetpack', plugins: 'woocommerce' }
		);

		expect( params.isUnifiedConnectionFlow ).toBe( true );
		expect( params.connectorPlugins ).toEqual( [ 'jetpack' ] );
	} );

	it( 'trims whitespace inside the plugins list', () => {
		const params = getConnectionFlowFromRedirectTo(
			'/jetpack/connect/authorize?from=jetpack-connector&plugins=jetpack,%20woocommerce'
		);

		expect( params.connectorPlugins ).toEqual( [ 'jetpack', 'woocommerce' ] );
	} );

	it( 'returns an empty plugin list when the plugins query param is absent', () => {
		const params = getConnectionFlowFromRedirectTo(
			'/jetpack/connect/authorize?from=jetpack-connector'
		);

		expect( params.isUnifiedConnectionFlow ).toBe( true );
		expect( params.connectorPlugins ).toEqual( [] );
	} );

	it( 'returns sensible defaults when redirect_to is missing', () => {
		expect( getConnectionFlowFromRedirectTo( undefined ) ).toEqual( {
			isUnifiedConnectionFlow: false,
			connectorPlugins: [],
		} );
	} );

	it( 'filters empty entries produced by trailing commas in plugins', () => {
		const params = getConnectionFlowFromRedirectTo(
			'/jetpack/connect/authorize?from=jetpack-connector&plugins=jetpack,,woocommerce,'
		);

		expect( params.connectorPlugins ).toEqual( [ 'jetpack', 'woocommerce' ] );
	} );
} );
