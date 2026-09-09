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
} = {} ) =>
	renderWithProvider(
		<AdsWrapper section="ads-earnings">
			<div />
		</AdsWrapper>,
		{
			initialState: {
				currentUser: { capabilities: { 1: { manage_options: manageOptions } } },
				sites: {
					items: { 1: { ID: 1, slug: 'example.wordpress.com', options: {} } },
					features,
				},
				ui: { selectedSiteId: 1 },
			},
			reducers: { ui: uiReducer, wordads: wordadsReducer },
		}
	);

const notAuthorized = 'You are not authorized to view this page';

describe( 'AdsWrapper', () => {
	it( 'only offers the WordAds upgrade to users who can upgrade the site', () => {
		const { unmount } = renderWrapper( { manageOptions: false } );
		expect( screen.queryByRole( 'link', { name: 'Upgrade' } ) ).not.toBeInTheDocument();
		expect( screen.queryByText( notAuthorized ) ).not.toBeInTheDocument();

		unmount();
		renderWrapper();
		expect( screen.getByRole( 'link', { name: 'Upgrade' } ) ).toBeVisible();
	} );

	// An unloaded feature list is indistinguishable from an absent feature, so
	// upselling on it flashes an Upgrade card at sites that already have WordAds.
	it( 'waits for site features before offering the upgrade', () => {
		renderWrapper( { features: {} } );
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
