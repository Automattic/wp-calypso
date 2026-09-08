/**
 * @jest-environment jsdom
 */
// @ts-nocheck - TODO: Fix TypeScript issues

import { screen } from '@testing-library/react';
import uiReducer from 'calypso/state/ui/reducer';
import wordadsReducer from 'calypso/state/wordads/reducer';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import AdsWrapper from '../wrapper';

const renderWrapper = ( manageOptions ) =>
	renderWithProvider(
		<AdsWrapper section="ads-earnings">
			<div />
		</AdsWrapper>,
		{
			initialState: {
				currentUser: { capabilities: { 1: { manage_options: manageOptions } } },
				sites: {
					items: { 1: { ID: 1, slug: 'example.wordpress.com', options: {} } },
					features: { 1: { data: { active: [] } } },
				},
				ui: { selectedSiteId: 1 },
			},
			reducers: { ui: uiReducer, wordads: wordadsReducer },
		}
	);

describe( 'AdsWrapper', () => {
	it( 'only offers the WordAds upgrade to users who can upgrade the site', () => {
		const { unmount } = renderWrapper( false );
		expect( screen.queryByRole( 'link', { name: 'Upgrade' } ) ).not.toBeInTheDocument();

		unmount();
		renderWrapper( true );
		expect( screen.getByRole( 'link', { name: 'Upgrade' } ) ).toBeVisible();
	} );
} );
