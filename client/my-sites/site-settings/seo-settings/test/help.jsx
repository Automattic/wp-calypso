/**
 * @jest-environment jsdom
 */
import { FEATURE_ADVANCED_SEO } from '@automattic/calypso-products';
import { screen } from '@testing-library/react';
import jetpack from 'calypso/state/jetpack/reducer';
import { reducer as ui } from 'calypso/state/ui/reducer';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import SeoSettingsHelpCard from '../help';

const siteId = 123456789;
const initialState = {
	ui: {
		selectedSiteId: siteId,
	},
};

const advancedSeoState = {
	sites: { features: { [ siteId ]: { data: { active: [ FEATURE_ADVANCED_SEO ] } } } },
};

const render = ( el, options ) =>
	renderWithProvider( el, { ...options, reducers: { ui, jetpack } } );

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

describe( 'SeoSettingsHelpCard "optimize your site\'s SEO" link', () => {
	const siteState = ( site ) => ( {
		sites: {
			...advancedSeoState.sites,
			items: { [ siteId ]: { ID: siteId, ...site } },
		},
	} );
	const seoToolsModuleState = {
		jetpack: { modules: { items: { [ siteId ]: { 'seo-tools': { available: true } } } } },
	};
	const getLink = () => screen.getByRole( 'link', { name: /optimize your site's seo/i } );

	test( 'opens the WordPress.com doc in the Help Center on Simple sites', () => {
		render( <SeoSettingsHelpCard />, {
			initialState: {
				...initialState,
				...siteState( { jetpack: false, options: { is_wpcom_simple: true } } ),
			},
		} );
		expect( getLink() ).toHaveAttribute( 'href', 'https://wordpress.com/support/seo/seo-tools/' );
		expect( getLink() ).toHaveClass( 'inline-support-link' );
	} );

	test( 'opens the WordPress.com doc in the Help Center on Atomic sites', () => {
		render( <SeoSettingsHelpCard />, {
			initialState: {
				...initialState,
				...siteState( {
					jetpack: true,
					options: { is_automated_transfer: true, is_wpcom_atomic: true },
				} ),
				...seoToolsModuleState,
			},
		} );
		expect( getLink() ).toHaveAttribute( 'href', 'https://wordpress.com/support/seo/seo-tools/' );
		expect( getLink() ).toHaveClass( 'inline-support-link' );
	} );

	test( 'links to the Jetpack doc on self-hosted Jetpack sites', () => {
		render( <SeoSettingsHelpCard />, {
			initialState: {
				...initialState,
				...siteState( { jetpack: true, options: {} } ),
				...seoToolsModuleState,
			},
		} );
		expect( getLink() ).toHaveAttribute( 'href', 'https://jetpack.com/support/seo-tools/' );
		expect( getLink() ).not.toHaveClass( 'inline-support-link' );
	} );
} );
