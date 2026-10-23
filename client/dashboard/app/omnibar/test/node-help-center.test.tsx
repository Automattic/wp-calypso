/**
 * @jest-environment jsdom
 */

import { omnibarSiteIdQuery } from '@automattic/api-queries';
import { QueryClient } from '@tanstack/react-query';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { select } from '@wordpress/data';
import nock from 'nock';
import { render } from '../../../test-utils';
import { APP_CONTEXT_DEFAULT_CONFIG } from '../../context';
import { shoppingCartManagerClient } from '../../shopping-cart';
import OmnibarContainer from '../omnibar';
import type { AppConfig } from '../../context';

const config: AppConfig = {
	...APP_CONTEXT_DEFAULT_CONFIG,
	supports: {
		...APP_CONTEXT_DEFAULT_CONFIG.supports,
		help: true,
	},
};

const helpCenterNode = {
	id: 'help-center',
	title:
		'<span title="Help Center"><svg id="help-center-icon" class="ab-icon" width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" fill-rule="evenodd" clip-rule="evenodd" d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm-1 16v-2h2v2h-2zm2-3v-1.141A3.991 3.991 0 0016 10a4 4 0 00-8 0h2c0-1.103.897-2 2-2s2 .897 2 2-.897 2-2 2a1 1 0 00-1 1v2h2z" /></svg><svg id="help-center-icon-with-notification" class="ab-icon" width="24" height="24" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.477 2 2 6.477 2 12C2 17.523 6.477 22 12 22C17.523 22 22 17.523 22 12C22 6.477 17.523 2 12 2ZM13 18H11V16H13V18ZM13 13.859V15H11V13C11 12.448 11.448 12 12 12C13.103 12 14 11.103 14 10C14 8.897 13.103 8 12 8C10.897 8 10 8.897 10 10H8C8 7.791 9.791 6 12 6C14.209 6 16 7.791 16 10C16 11.862 14.722 13.413 13 13.859Z" fill="currentColor"/><circle cx="20" cy="3.5" r="4.3" fill="#e65054" stroke="#1d2327" stroke-width="2"/></svg></span>',
	parent: 'top-secondary',
	href: 'https://wordpress.com/help?help-center=home',
	group: false,
	meta: {
		menu_title: '',
		icon: 'help',
	},
};

const myAccountNode = {
	id: 'my-account',
	title:
		"Howdy, <span class=\"display-name\">Test User</span><img alt='Test User&#039;s avatar' src='https://1.gravatar.com/avatar/test' class='avatar avatar-28' />",
	parent: 'top-secondary',
	href: 'https://my.wordpress.com/me/account',
	group: false,
	meta: {
		menu_title: 'Howdy, Test User',
	},
};

function mockDashboardAdminBar( nodes: object[] ) {
	nock( 'https://public-api.wordpress.com' )
		.get( '/wpcom/v2/dashboard/admin-bar' )
		.query( true )
		.reply( 200, { nodes } );
}

function renderOmnibar() {
	const queryClient = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
	queryClient.setQueryData( omnibarSiteIdQuery().queryKey, null );

	return render( <OmnibarContainer cartManagerClient={ shoppingCartManagerClient } />, {
		config,
		queryClient,
	} );
}

describe( '<Omnibar> help center node', () => {
	afterEach( () => nock.cleanAll() );

	test( 'shows the node', async () => {
		mockDashboardAdminBar( [ helpCenterNode, myAccountNode ] );

		const { recordTracksEvent } = renderOmnibar();

		const toolbar = screen.getByRole( 'navigation', { name: 'Toolbar' } );
		const node = await within( toolbar ).findByRole( 'button', { name: 'Help Center' } );
		// Without a menu title the node is icon only.
		expect( within( node ).queryByText( 'Help Center' ) ).not.toBeInTheDocument();
		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_inlinehelp_impression',
			expect.objectContaining( { location: 'help-center', entry_point: 'omnibar' } )
		);
	} );

	test( 'shows the menu title the backend sends', async () => {
		mockDashboardAdminBar( [
			{ ...helpCenterNode, meta: { ...helpCenterNode.meta, menu_title: 'Get Help' } },
			myAccountNode,
		] );

		renderOmnibar();

		const toolbar = screen.getByRole( 'navigation', { name: 'Toolbar' } );
		const node = await within( toolbar ).findByRole( 'button', { name: 'Get Help' } );
		expect( within( node ).getByText( 'Get Help' ) ).toBeVisible();
	} );

	test( 'opens the Help Center when clicking the node', async () => {
		const user = userEvent.setup();
		mockDashboardAdminBar( [ helpCenterNode, myAccountNode ] );

		renderOmnibar();

		const toolbar = screen.getByRole( 'navigation', { name: 'Toolbar' } );
		await user.click( await within( toolbar ).findByRole( 'button', { name: 'Help Center' } ) );

		await waitFor( () =>
			expect(
				(
					select( 'automattic/help-center' ) as unknown as { isHelpCenterShown: () => boolean }
				 )?.isHelpCenterShown()
			).toBe( true )
		);
	} );
} );
