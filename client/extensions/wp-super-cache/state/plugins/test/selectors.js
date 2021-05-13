/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { getPlugins, isRequestingPlugins, isTogglingPlugin } from '../selectors';

describe( 'selectors', () => {
	const primarySiteId = 123456;
	const secondarySiteId = 456789;

	describe( 'isRequestingPlugins()', () => {
		test( 'should return false if no state exists', () => {
			const state = {
				extensions: {
					wpSuperCache: {
						plugins: undefined,
					},
				},
			};
			const isRequesting = isRequestingPlugins( state, primarySiteId );

			expect( isRequesting ).to.be.false;
		} );

		test( 'should return false if the site is not attached', () => {
			const state = {
				extensions: {
					wpSuperCache: {
						plugins: {
							requesting: {
								[ primarySiteId ]: true,
							},
						},
					},
				},
			};
			const isRequesting = isRequestingPlugins( state, secondarySiteId );

			expect( isRequesting ).to.be.false;
		} );

		test( 'should return false if the plugins are not being fetched', () => {
			const state = {
				extensions: {
					wpSuperCache: {
						plugins: {
							requesting: {
								[ primarySiteId ]: false,
							},
						},
					},
				},
			};
			const isRequesting = isRequestingPlugins( state, primarySiteId );

			expect( isRequesting ).to.be.false;
		} );

		test( 'should return true if the plugins are being fetched', () => {
			const state = {
				extensions: {
					wpSuperCache: {
						plugins: {
							requesting: {
								[ primarySiteId ]: true,
							},
						},
					},
				},
			};
			const isRequesting = isRequestingPlugins( state, primarySiteId );

			expect( isRequesting ).to.be.true;
		} );
	} );

	describe( 'isTogglingPlugin()', () => {
		test( 'should return false if the site is not attached', () => {
			const state = {
				extensions: {
					wpSuperCache: {
						plugins: {
							toggling: {
								[ primarySiteId ]: { no_adverts_for_friends: true },
							},
						},
					},
				},
			};
			const isToggling = isTogglingPlugin( state, secondarySiteId, 'no_adverts_for_friends' );

			expect( isToggling ).to.be.false;
		} );

		test( 'should return false if the plugin is not being enabled or disabled', () => {
			const state = {
				extensions: {
					wpSuperCache: {
						plugins: {
							toggling: {
								[ primarySiteId ]: { no_adverts_for_friends: false },
							},
						},
					},
				},
			};
			const isToggling = isTogglingPlugin( state, primarySiteId, 'no_adverts_for_friends' );

			expect( isToggling ).to.be.false;
		} );

		test( 'should return true if the plugin is being enabled or disabled', () => {
			const state = {
				extensions: {
					wpSuperCache: {
						plugins: {
							toggling: {
								[ primarySiteId ]: { no_adverts_for_friends: true },
							},
						},
					},
				},
			};
			const isToggling = isTogglingPlugin( state, primarySiteId, 'no_adverts_for_friends' );

			expect( isToggling ).to.be.true;
		} );
	} );

	describe( 'getPlugins()', () => {
		const primaryPlugins = {
			awaitingmoderation: {
				url: '',
				title: 'Awaiting Moderation',
				desc:
					'Enables or disables plugin to Remove the text "Your comment is awaiting moderation." ...',
				enabled: true,
			},
			no_adverts_for_friends: {
				key: 'no_adverts_for_friends',
				url: 'https://odd.blog/no-adverts-for-friends/',
				title: 'No Adverts for Friends',
				desc: 'Provides support for No Adverts for Friends plugin.',
				enabled: false,
			},
		};

		test( 'should return null if no state exists', () => {
			const state = {
				extensions: {
					wpSuperCache: {
						plugins: undefined,
					},
				},
			};
			const plugins = getPlugins( state, primarySiteId );

			expect( plugins ).to.be.null;
		} );

		test( 'should return null if the site is not attached', () => {
			const state = {
				extensions: {
					wpSuperCache: {
						plugins: {
							items: {
								[ primarySiteId ]: primaryPlugins,
							},
						},
					},
				},
			};
			const plugins = getPlugins( state, secondarySiteId );

			expect( plugins ).to.be.null;
		} );

		test( 'should return the plugins for a siteId', () => {
			const state = {
				extensions: {
					wpSuperCache: {
						plugins: {
							items: {
								[ primarySiteId ]: primaryPlugins,
							},
						},
					},
				},
			};
			const plugins = getPlugins( state, primarySiteId );

			expect( plugins ).to.eql( primaryPlugins );
		} );
	} );
} );
