/**
 * @jest-environment jsdom
 */
// @ts-nocheck - TODO: Fix TypeScript issues

import { screen } from '@testing-library/react';
import uiReducer from 'calypso/state/ui/reducer';
import wordadsReducer from 'calypso/state/wordads/reducer';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import AdsWrapper from '../wrapper';

const renderWrapper = ( {
	manageOptions = true,
	features = { 1: { data: { active: [] } } },
	site = {},
} = {} ) =>
	renderWithProvider(
		<AdsWrapper section="ads-earnings">
			<div />
		</AdsWrapper>,
		{
			initialState: {
				currentUser: { capabilities: { 1: { manage_options: manageOptions } } },
				sites: {
					items: {
						1: {
							ID: 1,
							slug: 'example.wordpress.com',
							URL: 'https://example.wordpress.com',
							options: {},
							...site,
						},
					},
					features,
				},
				ui: { selectedSiteId: 1 },
			},
			reducers: { ui: uiReducer, wordads: wordadsReducer },
		}
	);

const notAuthorized = 'You are not authorized to view this page';

const upgradeUrl = () =>
	new URL(
		screen.getByRole( 'link', { name: 'Upgrade' } ).getAttribute( 'href' ),
		window.location.origin
	);

describe( 'AdsWrapper', () => {
	beforeEach( () => {
		window.history.pushState( {}, '', '/earn/ads-settings/example.wordpress.com' );
	} );

	it( 'only offers the WordAds upgrade to users who can upgrade the site', () => {
		const { unmount } = renderWrapper( { manageOptions: false } );
		expect( screen.queryByRole( 'link', { name: 'Upgrade' } ) ).not.toBeInTheDocument();
		expect( screen.queryByText( notAuthorized ) ).not.toBeInTheDocument();

		unmount();
		renderWrapper();
		expect( screen.getByRole( 'link', { name: 'Upgrade' } ) ).toBeVisible();
	} );

	// Without these, checkout drops the user on the generic thank-you page with no
	// way back to the ads dashboard they were setting up.
	it( 'sends the user back to the ads page after checkout', () => {
		renderWrapper();

		const url = upgradeUrl();
		expect( url.pathname ).toBe( '/checkout/example.wordpress.com/value_bundle' );
		expect( url.searchParams.get( 'redirect_to' ) ).toBe(
			'/earn/ads-settings/example.wordpress.com'
		);
		expect( url.searchParams.get( 'cancel_to' ) ).toBe(
			'/earn/ads-settings/example.wordpress.com'
		);
	} );

	it( 'sends a Jetpack site back to the ads page after checkout', () => {
		renderWrapper( { site: { jetpack: true } } );

		const url = upgradeUrl();
		expect( url.pathname ).toBe( '/checkout/example.wordpress.com/jetpack_security_daily' );
		expect( url.searchParams.get( 'redirect_to' ) ).toBe(
			'/earn/ads-settings/example.wordpress.com'
		);
	} );

	// The plans page forwards `redirect_to` to checkout, but has no use for
	// `cancel_to`.
	it( 'sends a site on an ineligible plan back to the ads page after checkout', () => {
		renderWithProvider(
			<AdsWrapper section="ads-earnings">
				<div />
			</AdsWrapper>,
			{
				initialState: {
					currentUser: { capabilities: { 1: { manage_options: true } } },
					sites: {
						items: {
							1: {
								ID: 1,
								slug: 'example.wordpress.com',
								URL: 'https://example.wordpress.com',
								options: { wordads: true },
							},
						},
						features: { 1: { data: { active: [] } } },
					},
					ui: { selectedSiteId: 1 },
					wordads: { status: { 1: { status: 'ineligible' } } },
				},
				reducers: { ui: uiReducer, wordads: wordadsReducer },
			}
		);

		const url = upgradeUrl();
		expect( url.pathname ).toBe( '/plans/example.wordpress.com' );
		expect( url.searchParams.get( 'redirect_to' ) ).toBe(
			'/earn/ads-settings/example.wordpress.com'
		);
	} );

	// An unloaded feature list is indistinguishable from an absent feature, so
	// upselling on it flashes an Upgrade card at sites that already have WordAds.
	it( 'waits for site features before offering the upgrade', () => {
		renderWrapper( { features: {} } );
		expect( screen.queryByRole( 'link', { name: 'Upgrade' } ) ).not.toBeInTheDocument();
		expect( screen.queryByText( notAuthorized ) ).not.toBeInTheDocument();
	} );

	// None of these can buy the WordPress.com plan the card links to. The last
	// reads as a Jetpack site while its `jetpack` flag stays false.
	it.each( [
		[ 'VIP', { is_vip: true } ],
		[ 'WP for Teams', { options: { is_wpforteams_site: true } } ],
		[ 'standalone Jetpack', { options: { jetpack_connection_active_plugins: [ 'boost' ] } } ],
	] )( 'offers no upgrade to a %s site', ( _label, site ) => {
		renderWrapper( { site } );
		expect( screen.queryByRole( 'link', { name: 'Upgrade' } ) ).not.toBeInTheDocument();
		expect( screen.queryByText( notAuthorized ) ).not.toBeInTheDocument();
	} );

	// P2 sites get no upsell, but hiding it must not take the gate with it and
	// leave them a live settings form.
	it( 'still gates the settings form for a P2 site on an ineligible plan', () => {
		const { container } = renderWithProvider(
			<AdsWrapper section="ads-settings">
				<div>settings form</div>
			</AdsWrapper>,
			{
				initialState: {
					currentUser: { capabilities: { 1: { manage_options: true } } },
					sites: {
						items: {
							1: {
								ID: 1,
								slug: 'example.wordpress.com',
								options: { wordads: true, is_wpforteams_site: true },
							},
						},
						features: { 1: { data: { active: [] } } },
					},
					ui: { selectedSiteId: 1 },
					wordads: { status: { 1: { status: 'ineligible' } } },
				},
				reducers: { ui: uiReducer, wordads: wordadsReducer },
			}
		);

		expect( screen.queryByRole( 'link', { name: 'Upgrade' } ) ).not.toBeInTheDocument();
		expect( container.querySelector( '.feature-example' ) ).toBeInTheDocument();
	} );
} );
