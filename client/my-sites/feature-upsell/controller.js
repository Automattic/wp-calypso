/**
 * External dependencies
 */
import React from 'react';
import page from 'page';

/**
 * Internal Dependencies
 */
import {
	FeaturesComponent,
	PluginsUpsellComponent,
	StoreUpsellComponent,
	ThemesUpsellComponent,
	WordAdsUpsellComponent,
} from './main';
import { getSiteFragment } from 'lib/route';

const featurePageController = ( url, callback ) => {
	return function ( context, next ) {
		// Upsell is site-specific so site fragment is required
		const siteFragment = getSiteFragment( context.path );
		if ( ! siteFragment ) {
			return page.redirect( url );
		}

		return callback( context, next, siteFragment );
	};
};

export default {
	features: featurePageController( '/feature', function ( context, next ) {
		context.primary = React.createElement( FeaturesComponent );
		next();
	} ),

	storeUpsell: featurePageController( '/feature/store', function ( context, next ) {
		context.primary = React.createElement( StoreUpsellComponent );
		next();
	} ),

	pluginsUpsell: featurePageController( '/feature/plugins', function ( context, next ) {
		context.primary = React.createElement( PluginsUpsellComponent );
		next();
	} ),

	themesUpsell: featurePageController( '/feature/themes', function ( context, next ) {
		context.primary = React.createElement( ThemesUpsellComponent );
		next();
	} ),

	wordAdsUpsell: featurePageController( '/feature/ads', function ( context, next ) {
		context.primary = React.createElement( WordAdsUpsellComponent );
		next();
	} ),
};
