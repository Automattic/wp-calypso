/**
 * @jest-environment jsdom
 */
import { FEATURE_ADVANCED_SEO } from '@automattic/calypso-products';
import { screen } from '@testing-library/react';
import { reducer as ui } from 'calypso/state/ui/reducer';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import SeoSettingsHelpCard from '../help';

const siteId = 1;
const initialState = {
	ui: {
		selectedSiteId: siteId,
	},
};

const advancedSeoState = {
	sites: { features: { [ siteId ]: { data: { active: [ FEATURE_ADVANCED_SEO ] } } } },
};

const render = ( el, options ) => renderWithProvider( el, { ...options, reducers: { ui } } );

describe( 'SeoSettingsHelpCard basic tests', () => {
	test( 'should render SEO help card when has advanced seo', () => {
		render( <SeoSettingsHelpCard />, {
			initialState: {
				...initialState,
				...advancedSeoState,
			},
		} );
		expect( screen.queryByText( /more advanced control/i ) ).toBeVisible();
	} );

	test( 'should not render SEO help card when does not have advanced seo', () => {
		render( <SeoSettingsHelpCard />, { initialState } );
		expect( screen.queryByText( /more advanced control/i ) ).not.toBeInTheDocument();
	} );
} );
