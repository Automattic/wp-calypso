/**
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import React from 'react';
import { shallow } from 'enzyme';

/**
 * Internal dependencies
 */
import { MySitesSidebar } from '..';
import config from 'calypso/config';
import { abtest } from 'calypso/lib/abtest';

jest.mock( 'calypso/lib/user', () => () => null );
jest.mock( 'calypso/lib/user/index', () => () => {} );
jest.mock( 'calypso/lib/analytics/tracks', () => ( {} ) );
jest.mock( 'calypso/lib/analytics/page-view', () => ( {} ) );
jest.mock( 'calypso/lib/abtest', () => ( {
	abtest: jest.fn( () => {
		return 'sidebarUpsells';
	} ),
} ) );
jest.mock( 'calypso/lib/cart/store/index', () => null );
jest.mock( 'calypso/lib/analytics/track-component-view', () => 'TrackComponentView' );
jest.mock( 'calypso/my-sites/sidebar/utils', () => ( {
	itemLinkMatches: jest.fn( () => true ),
} ) );

jest.mock( 'calypso/config', () => {
	const configMock = () => '';
	configMock.isEnabled = jest.fn( () => true );
	return configMock;
} );

describe( 'MySitesSidebar', () => {
	describe( 'MySitesSidebar.store()', () => {
		const defaultProps = {
			site: {},
			siteSuffix: '/mysite.com',
			translate: ( x ) => x,
		};

		beforeEach( () => {
			config.isEnabled.mockImplementation( () => true );
			abtest.mockImplementation( () => 'sidebarUpsells' );
		} );

		test( 'Should return null item if woocommerce/extension-dashboard is disabled', () => {
			config.isEnabled.mockImplementation(
				( feature ) => feature !== 'woocommerce/extension-dashboard'
			);
			const Sidebar = new MySitesSidebar( {
				isSiteAutomatedTransfer: false,
				canUserUpgradeSite: true,
				...defaultProps,
			} );
			const Store = () => Sidebar.store();

			const wrapper = shallow( <Store /> );
			expect( wrapper.html() ).toEqual( null );
		} );

		test( 'Should return store menu item if user can use store on this site', () => {
			const Sidebar = new MySitesSidebar( {
				canUserUseStore: true,
				...defaultProps,
				site: {
					plan: {
						product_slug: 'business-bundle',
					},
				},
			} );
			const Store = () => Sidebar.store();

			const wrapper = shallow( <Store /> );
			expect( wrapper.props().link ).toEqual( '/store/mysite.com' );
		} );

		test( 'Should return Calypsoified store menu item if user can use store on this site and the site is an ecommerce plan', () => {
			const Sidebar = new MySitesSidebar( {
				canUserUseStore: true,
				...defaultProps,
				site: {
					options: {
						admin_url: 'http://test.com/wp-admin/',
					},
					plan: {
						product_slug: 'ecommerce-bundle',
					},
				},
			} );
			const Store = () => Sidebar.store();

			const wrapper = shallow( <Store /> );
			expect( wrapper.props().link ).toEqual(
				'http://test.com/wp-admin/admin.php?page=wc-admin&calypsoify=1'
			);
		} );

		test( 'Should return null item if user who can upgrade can not use store on this site (control a/b group)', () => {
			abtest.mockImplementation( () => 'control' );
			const Sidebar = new MySitesSidebar( {
				canUserUseStore: false,
				canUserUpgradeSite: true,
				...defaultProps,
			} );
			const Store = () => Sidebar.store();

			const wrapper = shallow( <Store /> );
			expect( wrapper.html() ).toEqual( null );
		} );

		test( "Should return null if user who can't upgrade  user can not use store on this site (control a/b group)", () => {
			abtest.mockImplementation( () => 'control' );
			const Sidebar = new MySitesSidebar( {
				canUserUseStore: false,
				canUserUpgradeSite: true,
				...defaultProps,
			} );
			const Store = () => Sidebar.store();

			const wrapper = shallow( <Store /> );
			expect( wrapper.html() ).toEqual( null );
		} );
	} );

	describe( 'MySitesSidebar.woocommerce()', () => {
		const defaultProps = {
			site: {},
			siteSuffix: '/mysite.com',
			translate: ( x ) => x,
		};

		beforeEach( () => {
			config.isEnabled.mockImplementation( () => true );
		} );

		test( 'Should return null item if woocommerce/store-deprecated is disabled', () => {
			config.isEnabled.mockImplementation(
				( feature ) => feature !== 'woocommerce/store-deprecated'
			);
			const Sidebar = new MySitesSidebar( {
				canUserUserStore: true,
				...defaultProps,
				site: {
					plan: {
						product_slug: 'business-bundle',
					},
				},
			} );
			const WooCommerce = () => Sidebar.woocommerce();

			const wrapper = shallow( <WooCommerce /> );
			expect( wrapper.html() ).toEqual( null );
		} );

		test( 'Should return null item if site has Personal plan', () => {
			const Sidebar = new MySitesSidebar( {
				...defaultProps,
				site: {
					plan: {
						product_slug: 'personal',
					},
				},
			} );
			const WooCommerce = () => Sidebar.woocommerce();

			const wrapper = shallow( <WooCommerce /> );
			expect( wrapper.html() ).toEqual( null );
		} );

		test( 'Should return null item if site has eCommerce plan', () => {
			const Sidebar = new MySitesSidebar( {
				canUserUseStore: true,
				...defaultProps,
				site: {
					plan: {
						product_slug: 'ecommerce-bundle',
					},
				},
			} );
			const WooCommerce = () => Sidebar.woocommerce();

			const wrapper = shallow( <WooCommerce /> );
			expect( wrapper.html() ).toEqual( null );
		} );

		test( 'Should return null item if site has Business plan and user cannot use store', () => {
			const Sidebar = new MySitesSidebar( {
				canUserUseStore: false,
				...defaultProps,
				site: {
					plan: {
						product_slug: 'business-bundle',
					},
				},
			} );
			const WooCommerce = () => Sidebar.woocommerce();

			const wrapper = shallow( <WooCommerce /> );
			expect( wrapper.html() ).toEqual( null );
		} );

		test( 'Should return WooCommerce menu item if site has Business plan and user can use store', () => {
			const Sidebar = new MySitesSidebar( {
				canUserUseStore: true,
				...defaultProps,
				site: {
					options: {
						admin_url: 'http://test.com/wp-admin/',
					},
					plan: {
						product_slug: 'business-bundle',
					},
				},
			} );
			const WooCommerce = () => Sidebar.woocommerce();

			const wrapper = shallow( <WooCommerce /> );
			expect( wrapper.html() ).not.toEqual( null );
			expect( wrapper.props().link ).toEqual( 'http://test.com/wp-admin/admin.php?page=wc-admin' );
		} );
	} );

	describe( 'MySitesSidebar.earn()', () => {
		const defaultProps = {
			site: {
				plan: {
					product_slug: 'business-bundle',
				},
			},
			siteSuffix: '/mysite.com',
			translate: ( x ) => x,
		};

		test( 'Should return null item if no site selected', () => {
			const Sidebar = new MySitesSidebar( {
				site: null,
				siteSuffix: '',
				translate: ( x ) => x,
			} );
			const Earn = () => Sidebar.earn();
			const wrapper = shallow( <Earn /> );

			expect( wrapper.html() ).toEqual( null );
		} );

		test( 'Should return null item if signup/wpforteams enabled and isSiteWPForTeams', () => {
			const Sidebar = new MySitesSidebar( {
				isSiteWPForTeams: true,
				...defaultProps,
			} );

			const Earn = () => Sidebar.earn();
			const wrapper = shallow( <Earn /> );

			expect( wrapper.html() ).toEqual( null );
		} );

		test( 'Should return null item if site present but user cannot earn', () => {
			const Sidebar = new MySitesSidebar( {
				canUserUseEarn: false,
				...defaultProps,
			} );

			const Earn = () => Sidebar.earn();
			const wrapper = shallow( <Earn /> );

			expect( wrapper.html() ).toEqual( null );
		} );

		test( 'Should return earn menu item if site present and user can earn', () => {
			const Sidebar = new MySitesSidebar( {
				canUserUseEarn: true,
				...defaultProps,
			} );

			const Earn = () => Sidebar.earn();
			const wrapper = shallow( <Earn /> );

			expect( wrapper.html() ).not.toEqual( null );
		} );
	} );

	describe( 'MySitesSidebar.wpAdmin()', () => {
		test( 'Should return null if no site selected', () => {
			const Sidebar = new MySitesSidebar( {
				site: null,
				siteSuffix: '',
				translate: ( x ) => x,
			} );
			const Admin = () => Sidebar.wpAdmin();
			const wrapper = shallow( <Admin /> );

			expect( wrapper.html() ).toEqual( null );
		} );

		test( 'Should return null if no admin_url is set', () => {
			const Sidebar = new MySitesSidebar( {
				site: {
					options: {
						admin_url: '',
					},
				},
				siteSuffix: '',
				translate: ( x ) => x,
			} );
			const Admin = () => Sidebar.wpAdmin();
			const wrapper = shallow( <Admin /> );

			expect( wrapper.html() ).toEqual( null );
		} );

		test( 'Should not return null for a simple site', () => {
			const Sidebar = new MySitesSidebar( {
				site: {
					options: {
						admin_url: 'https://example.com/wp-admin/',
					},
				},
				siteSuffix: '',
				translate: ( x ) => x,
			} );
			const Admin = () => Sidebar.wpAdmin();
			const wrapper = shallow( <Admin /> );

			expect( wrapper.html() ).not.toEqual( null );
		} );

		test( 'Should not return null for an Atomic site', () => {
			const Sidebar = new MySitesSidebar( {
				isJetpack: true,
				isAtomicSite: true,
				site: {
					options: {
						admin_url: 'https://example.com/wp-admin/',
					},
				},
				siteSuffix: '',
				translate: ( x ) => x,
			} );
			const Admin = () => Sidebar.wpAdmin();
			const wrapper = shallow( <Admin /> );

			expect( wrapper.html() ).not.toEqual( null );
		} );

		test( 'Should not return null for a VIP site', () => {
			const Sidebar = new MySitesSidebar( {
				isVip: true,
				site: {
					options: {
						admin_url: 'https://example.com/wp-admin/',
					},
				},
				siteSuffix: '',
				translate: ( x ) => x,
			} );
			const Admin = () => Sidebar.wpAdmin();
			const wrapper = shallow( <Admin /> );

			expect( wrapper.html() ).not.toEqual( null );
		} );

		test( 'Should not return null for a Jetpack site', () => {
			const Sidebar = new MySitesSidebar( {
				isJetpack: true,
				isAtomicSite: false,
				site: {
					options: {
						admin_url: 'https://example.com/wp-admin/',
					},
				},
				siteSuffix: '',
				translate: ( x ) => x,
			} );
			const Admin = () => Sidebar.wpAdmin();
			const wrapper = shallow( <Admin /> );

			expect( wrapper.html() ).not.toEqual( null );
		} );

		test( 'Should return null for a Jetpack site with an invalid admin_url', () => {
			const Sidebar = new MySitesSidebar( {
				isJetpack: true,
				isAtomicSite: false,
				site: {
					options: {
						admin_url: 'example\\.com',
					},
				},
				siteSuffix: '',
				translate: ( x ) => x,
			} );
			const Admin = () => Sidebar.wpAdmin();
			const wrapper = shallow( <Admin /> );

			expect( wrapper.html() ).toEqual( null );
		} );
	} );
} );
