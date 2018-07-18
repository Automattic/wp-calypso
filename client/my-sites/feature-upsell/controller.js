/** @format */

/**
 * External dependencies
 */
import React from 'react';
import page from 'page';

/**
 * Internal Dependencies
 */
import {
	PluginsUpsellComponent,
	StoreUpsellComponent,
	ThemesUpsellComponent,
	WordAdsUpsellComponent,
} from './main';
import { getSiteFragment } from 'lib/route';
import {
	canCurrentUserUseStore,
	canCurrentUserUseAds,
	canAdsBeEnabledOnCurrentSite,
	canCurrentUserUpgradeSite,
} from 'state/sites/selectors';

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
	wordAdsUpsell: function( context, next ) {
		const siteFragment = getSiteFragment( context.path );
		if ( ! siteFragment ) {
			return page.redirect( '/feature/ads' );
		}

		const state = context.store.getState();
		if ( ! canCurrentUserUpgradeSite( state ) ) {
			return page.redirect( '/stats/' + siteFragment );
		}

		if ( canCurrentUserUseAds( state ) ) {
			return page.redirect( '/ads/earnings/' + siteFragment );
		}

		if ( canAdsBeEnabledOnCurrentSite( state ) ) {
			return page.redirect( '/ads/settings/' + siteFragment );
		}

		// Render
		context.primary = React.createElement( WordAdsUpsellComponent );
		next();
	},
};
