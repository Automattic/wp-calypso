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

describe( 'AdsWrapper', () => {
	it( 'only offers the WordAds upgrade to users who can upgrade the site', () => {
		const { unmount } = renderWrapper( { manageOptions: false } );
		expect( screen.queryByRole( 'link', { name: 'Upgrade' } ) ).not.toBeInTheDocument();

		unmount();
		renderWrapper();
		expect( screen.getByRole( 'link', { name: 'Upgrade' } ) ).toBeVisible();
	} );

	// An unloaded feature list is indistinguishable from an absent feature, so
	// upselling on it flashes an Upgrade card at sites that already have WordAds.
	it( 'waits for site features before offering the upgrade', () => {
		renderWrapper( { features: {} } );
		expect( screen.queryByRole( 'link', { name: 'Upgrade' } ) ).not.toBeInTheDocument();
	} );
} );
