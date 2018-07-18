/** @format */

/**
 * External dependencies
 */
import React from 'react';
import page from 'page';

/**
 * Internal Dependencies
 */
import { PluginsUpsellComponent, StoreUpsellComponent, ThemesUpsellComponent } from './main';
import { getSiteFragment } from 'lib/route';
import { canCurrentUserUseStore } from 'state/sites/selectors';

export default {
	storeUpsell: function( context, next ) {
		const siteFragment = getSiteFragment( context.path );
		if ( ! siteFragment ) {
			return page.redirect( '/feature/store' );
		}

		if ( canCurrentUserUseStore( context.store.getState() ) ) {
			return page.redirect( '/store/' + siteFragment );
		}

		// Render
		context.primary = React.createElement( StoreUpsellComponent );
		next();
	},
	pluginsUpsell: function( context, next ) {
		const siteFragment = getSiteFragment( context.path );
		if ( ! siteFragment ) {
			return page.redirect( '/feature/plugins' );
		}

		// Render
		context.primary = React.createElement( PluginsUpsellComponent );
		next();
	},
	themesUpsell: function( context, next ) {
		const siteFragment = getSiteFragment( context.path );
		if ( ! siteFragment ) {
			return page.redirect( '/feature/themes' );
		}

		// Render
		context.primary = React.createElement( ThemesUpsellComponent );
		next();
	},
};
