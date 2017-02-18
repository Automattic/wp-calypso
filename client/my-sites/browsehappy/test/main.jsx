/**
 * External dependencies
 */
import React from 'react';
import update from 'react-addons-update';
import { Provider as ReduxProvider } from 'react-redux';
import { expect } from 'chai';
import { renderToStaticMarkup } from 'react-dom/server';

/**
 * Internal dependencies
 */
import { createReduxStore } from 'state';

const baseState = {
	currentUser: { id: 111 },
	sites: {
		items: {
			222: {
				options: {
					admin_url: 'https://testsite2.wordpress.com/wp-admin/'
				}
			},
			333: {
				options: {
					admin_url: 'https://testsite3.wordpress.com/wp-admin/'
				}
			}
		}
	},
	ui: {
		selectedSiteId: undefined
	},
	users: {
		items: {
			111: {
				primary_blog: undefined
			}
		}
	}
};

const stateWithPrimarySite = update( baseState, {
	users: { items: { 111: { primary_blog: { $set: 222 } } } }
} );

const stateWithSelectedSite = update( baseState, {
	ui: { selectedSiteId: { $set: 333 } }
} );

const stateWithBoth = update( baseState, {
	users: { items: { 111: { primary_blog: { $set: 222 } } } },
	ui: { selectedSiteId: { $set: 333 } }
} );

describe( 'main', function() {
	describe( 'calling renderToStaticMarkup() on BrowseHappy page', function() {
		before( function() {
			this.BrowseHappyComponent = require( '../main' );
		} );

		describe( 'when no selected or primary sites available', function() {
			it( "links to Dashboard's wp-login.php when logged out", function() {
				const store = createReduxStore();
				const layout = (
					<ReduxProvider store={ store }>
						<this.BrowseHappyComponent />
					</ReduxProvider>
				);
				let markup;
				expect( () => {
					markup = renderToStaticMarkup( layout );
				} ).to.not.throw();
				expect( markup )
					.to.include( 'browsehappy__main' )
					.and.to.include( 'href="https://dashboard.wordpress.com/wp-login.php"' )
					.and.to.not.include( 'wp-admin' );
			} );

			it( "links to Dashboard's wp-admin when logged in", function() {
				const store = createReduxStore( baseState );
				const layout = (
					<ReduxProvider store={ store }>
						<this.BrowseHappyComponent />
					</ReduxProvider>
				);
				let markup;
				expect( () => {
					markup = renderToStaticMarkup( layout );
				} ).to.not.throw();
				expect( markup )
					.to.include( 'browsehappy__main' )
					.and.to.include( 'href="https://dashboard.wordpress.com/wp-admin/"' )
					.and.to.not.include( 'wp-login' );
			} );
		} );

		it( "links to the primary site's wp-admin", function() {
			const store = createReduxStore( stateWithPrimarySite );
			const layout = (
				<ReduxProvider store={ store }>
					<this.BrowseHappyComponent />
				</ReduxProvider>
			);
			let markup;
			expect( () => {
				markup = renderToStaticMarkup( layout );
			} ).to.not.throw();
			expect( markup )
				.to.include( 'browsehappy__main' )
				.and.to.include( 'href="https://testsite2.wordpress.com/wp-admin/"' )
				.and.to.not.include( 'dashboard.wordpress' )
				.and.to.not.include( 'testsite3' );
		} );

		it( "links to the selected site's wp-admin", function() {
			const store = createReduxStore( stateWithSelectedSite );
			const layout = (
				<ReduxProvider store={ store }>
					<this.BrowseHappyComponent />
				</ReduxProvider>
			);
			let markup;
			expect( () => {
				markup = renderToStaticMarkup( layout );
			} ).to.not.throw();
			expect( markup )
				.to.include( 'browsehappy__main' )
				.and.to.include( 'href="https://testsite3.wordpress.com/wp-admin/"' )
				.and.to.not.include( 'dashboard.wordpress' )
				.and.to.not.include( 'testsite2' );
		} );

		it( 'prefers selected site over primary', function() {
			const store = createReduxStore( stateWithBoth );
			const layout = (
				<ReduxProvider store={ store }>
					<this.BrowseHappyComponent />
				</ReduxProvider>
			);
			let markup;
			expect( () => {
				markup = renderToStaticMarkup( layout );
			} ).to.not.throw();
			expect( markup )
				.to.include( 'browsehappy__main' )
				.and.to.include( 'href="https://testsite3.wordpress.com/wp-admin/"' )
				.and.to.not.include( 'dashboard.wordpress' )
				.and.to.not.include( 'testsite2' );
		} );
	} );
} );
