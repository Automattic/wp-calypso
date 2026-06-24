/**
 * @jest-environment jsdom
 */
import { recordTracksEvent } from '@automattic/calypso-analytics';
import {
	recordNavItemHover,
	recordSubmenuShow,
	recordSubmenuHide,
	recordMobileMenuOpen,
	recordMobileMenuClose,
	recordMobileCategorySelect,
	recordMobileBack,
	recordNavLinkClick,
	resetNavHoverDedupe,
} from '../tracks';

jest.mock( '@automattic/calypso-analytics', () => ( {
	recordTracksEvent: jest.fn(),
} ) );

const mockRecord = recordTracksEvent as jest.MockedFunction< typeof recordTracksEvent >;

describe( 'nav-2026 tracks', () => {
	beforeEach( () => {
		mockRecord.mockClear();
		resetNavHoverDedupe();
		document.body.innerHTML = '';
	} );

	describe( 'recordNavItemHover', () => {
		it( 'fires item_hover with is_2026, is_floating, name, is_dropdown', () => {
			recordNavItemHover( true, 'websites', true );
			expect( mockRecord ).toHaveBeenCalledWith( 'calypso_global_nav_item_hover', {
				is_2026: true,
				is_floating: true,
				name: 'websites',
				is_dropdown: true,
			} );
		} );

		it( 'dedupes consecutive hovers of the same item', () => {
			recordNavItemHover( false, 'hosting', true );
			recordNavItemHover( false, 'hosting', true );
			expect( mockRecord ).toHaveBeenCalledTimes( 1 );
		} );

		it( 're-fires after a different item, and after a dedupe reset', () => {
			recordNavItemHover( false, 'hosting', true );
			recordNavItemHover( false, 'domains', true );
			expect( mockRecord ).toHaveBeenCalledTimes( 2 );

			resetNavHoverDedupe();
			recordNavItemHover( false, 'domains', true );
			expect( mockRecord ).toHaveBeenCalledTimes( 3 );
		} );
	} );

	describe( 'submenu show/hide', () => {
		it( 'fires submenu_show with the name', () => {
			recordSubmenuShow( false, 'resources' );
			expect( mockRecord ).toHaveBeenCalledWith( 'calypso_global_nav_submenu_show', {
				is_2026: true,
				is_floating: false,
				name: 'resources',
			} );
		} );

		it( 'fires submenu_hide with the name', () => {
			recordSubmenuHide( true, 'resources' );
			expect( mockRecord ).toHaveBeenCalledWith( 'calypso_global_nav_submenu_hide', {
				is_2026: true,
				is_floating: true,
				name: 'resources',
			} );
		} );
	} );

	describe( 'mobile menu open/close', () => {
		it( 'fires mobile_menu_open with burger_menu reason + start type + viewport width', () => {
			recordMobileMenuOpen( false );
			expect( mockRecord ).toHaveBeenCalledWith( 'calypso_global_nav_mobile_menu_open', {
				is_2026: true,
				is_floating: false,
				reason: 'burger_menu',
				start_type: 'burger_menu',
				viewport_width: window.innerWidth,
			} );
		} );

		it( 'fires mobile_menu_close with the reason', () => {
			recordMobileMenuClose( false, 'overlay' );
			expect( mockRecord ).toHaveBeenCalledWith( 'calypso_global_nav_mobile_menu_close', {
				is_2026: true,
				is_floating: false,
				reason: 'overlay',
				viewport_width: window.innerWidth,
			} );
		} );
	} );

	describe( 'mobile category/back', () => {
		it( 'fires category_select with name + title', () => {
			recordMobileCategorySelect( false, 'hosting', 'Hosting' );
			expect( mockRecord ).toHaveBeenCalledWith( 'calypso_global_nav_mobile_category_select', {
				is_2026: true,
				is_floating: false,
				name: 'hosting',
				title: 'Hosting',
			} );
		} );

		it( 'fires back with from_name (nullable)', () => {
			recordMobileBack( false, 'hosting' );
			expect( mockRecord ).toHaveBeenCalledWith( 'calypso_global_nav_mobile_back', {
				is_2026: true,
				is_floating: false,
				from_name: 'hosting',
			} );

			mockRecord.mockClear();
			recordMobileBack( false, null );
			expect( mockRecord ).toHaveBeenCalledWith( 'calypso_global_nav_mobile_back', {
				is_2026: true,
				is_floating: false,
				from_name: null,
			} );
		} );
	} );

	describe( 'recordNavLinkClick', () => {
		// Builds a detached DOM tree and returns the inner <a> so closest() works.
		function linkIn( html: string ): HTMLAnchorElement {
			const host = document.createElement( 'div' );
			host.innerHTML = html;
			document.body.appendChild( host );
			return host.querySelector( 'a' ) as HTMLAnchorElement;
		}

		it( 'resolves a desktop-dropdown link to its category via data-dropdown-name', () => {
			const link = linkIn(
				`<div class="lpc-header-nav-container is-scrolled">
					<div class="x-dropdown x-dropdown--2026">
						<div class="x-dropdown-content" data-dropdown-name="hosting">
							<a href="https://wordpress.com/hosting/">Managed hosting</a>
						</div>
					</div>
				</div>`
			);
			recordNavLinkClick( link );
			expect( mockRecord ).toHaveBeenCalledWith(
				'calypso_global_nav_link_click',
				expect.objectContaining( {
					is_2026: true,
					is_floating: true,
					source: 'desktop_dropdown',
					category: 'hosting',
					text: 'Managed hosting',
				} )
			);
		} );

		it( 'resolves a mobile-dropdown link to its category', () => {
			const link = linkIn(
				`<div class="x-menu x-menu--2026">
					<ul class="x-menu-mobile-dropdown-list" data-dropdown-name="domains">
						<li><a href="https://wordpress.com/domains/">Find a domain</a></li>
					</ul>
				</div>`
			);
			recordNavLinkClick( link );
			expect( mockRecord ).toHaveBeenCalledWith(
				'calypso_global_nav_link_click',
				expect.objectContaining( {
					is_2026: true,
					source: 'mobile_dropdown',
					category: 'domains',
				} )
			);
		} );

		it( 'resolves the logo and a top-level link, and reports is_2026 false outside the 2026 nav', () => {
			const logo = linkIn(
				`<nav class="x-nav x-nav--2026-redesign">
					<a class="x-nav-link x-nav-link__logo" href="https://wordpress.com">logo</a>
				</nav>`
			);
			recordNavLinkClick( logo );
			expect( mockRecord ).toHaveBeenCalledWith(
				'calypso_global_nav_link_click',
				expect.objectContaining( { is_2026: true, source: 'logo', is_floating: false } )
			);

			mockRecord.mockClear();
			const legacy = linkIn(
				'<nav class="x-nav"><a href="https://wordpress.com/pricing/">Pricing</a></nav>'
			);
			recordNavLinkClick( legacy );
			expect( mockRecord ).toHaveBeenCalledWith(
				'calypso_global_nav_link_click',
				expect.objectContaining( { is_2026: false, source: 'top_level', category: null } )
			);
		} );
	} );
} );
