/**
 * @jest-environment jsdom
 */
jest.mock( 'calypso/components/data/query-jetpack-connection', () => () => null );
jest.mock( 'calypso/my-sites/site-settings/jetpack-module-toggle', () => () => null );

import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import jetpack from 'calypso/state/jetpack/reducer';
import { reducer as ui } from 'calypso/state/ui/reducer';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import Sitemaps from '../sitemaps';

const siteId = 123456789;

const stateForSite = ( site ) => ( {
	ui: { selectedSiteId: siteId },
	sites: { items: { [ siteId ]: { ID: siteId, URL: 'https://example.wordpress.com', ...site } } },
} );

const render = ( initialState ) =>
	renderWithProvider( <Sitemaps fields={ { blog_public: '1' } } />, {
		initialState,
		reducers: { ui, jetpack },
	} );

const openInfoPopover = async () => {
	await userEvent.click( screen.getByRole( 'button' ) );
	return screen.getByRole( 'link', { name: /learn more/i } );
};

describe( 'Sitemaps support link', () => {
	test( 'opens the WordPress.com doc in the Help Center on Simple sites', async () => {
		render( stateForSite( { jetpack: false, options: { is_wpcom_simple: true } } ) );

		const link = await openInfoPopover();

		expect( link ).toHaveAttribute( 'href', 'https://wordpress.com/support/sitemaps/' );
		expect( link ).not.toHaveAttribute( 'target' );
		expect(
			screen.queryByRole( 'link', { name: /privacy information/i } )
		).not.toBeInTheDocument();
	} );

	test( 'opens the WordPress.com doc in the Help Center on Atomic sites', async () => {
		render(
			stateForSite( {
				jetpack: true,
				options: { is_automated_transfer: true, is_wpcom_atomic: true },
			} )
		);

		const link = await openInfoPopover();

		expect( link ).toHaveAttribute( 'href', 'https://wordpress.com/support/sitemaps/' );
		expect( link ).not.toHaveAttribute( 'target' );
		expect(
			screen.queryByRole( 'link', { name: /privacy information/i } )
		).not.toBeInTheDocument();
	} );

	test( 'keeps the Jetpack doc in a new tab on self-hosted Jetpack sites', async () => {
		render( stateForSite( { jetpack: true, options: {} } ) );

		const link = await openInfoPopover();

		expect( link ).toHaveAttribute( 'href', 'https://jetpack.com/support/sitemaps/' );
		expect( link ).toHaveAttribute( 'target', '_blank' );
		expect( screen.getByRole( 'link', { name: /privacy information/i } ) ).toBeInTheDocument();
	} );
} );
