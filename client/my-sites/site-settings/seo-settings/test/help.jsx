/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import { reducer as ui } from 'calypso/state/ui/reducer';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import SeoSettingsHelpCard from '../help';

const siteId = 123456789;
const initialState = {
	sites: { items: { [ siteId ]: { ID: siteId, jetpack: false } } },
	ui: {
		selectedSiteId: siteId,
	},
};

const render = ( el, options ) => renderWithProvider( el, { ...options, reducers: { ui } } );

describe( 'SeoSettingsHelpCard basic tests', () => {
	test( 'offers SEO help on a free Simple site', () => {
		render( <SeoSettingsHelpCard />, {
			initialState: {
				...initialState,
			},
		} );
		expect( screen.queryByText( /more advanced control/i ) ).toBeVisible();
	} );

	test( 'withholds SEO controls on a VIP site', () => {
		render( <SeoSettingsHelpCard />, {
			initialState: {
				...initialState,
				sites: { items: { [ siteId ]: { ID: siteId, jetpack: false, is_vip: true } } },
			},
		} );
		expect( screen.queryByText( /more advanced control/i ) ).not.toBeInTheDocument();
	} );
} );
