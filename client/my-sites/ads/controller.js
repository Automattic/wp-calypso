/** @format */

/**
 * External dependencies
 */

import React from 'react';
import i18n from 'i18n-calypso';
import page from 'page';

/**
 * Internal Dependencies
 */
import { sectionify } from 'lib/route';
import analytics from 'lib/analytics';
import titlecase from 'to-title-case';
import { canAccessWordads } from 'lib/ads/utils';
import { setDocumentHeadTitle as setTitle } from 'state/document-head/actions';
import { userCan } from 'lib/site/utils';
import { getSelectedSite, getSelectedSiteId } from 'state/ui/selectors';
import { isJetpackSite } from 'state/sites/selectors';
import Ads from 'my-sites/ads/main';

function _recordPageView( context, analyticsPageTitle ) {
	const basePath = sectionify( context.path );
	if ( 'undefined' !== typeof context.params.section ) {
		analyticsPageTitle += ' > ' + titlecase( context.params.section );
	}

	analytics.ga.recordPageView( basePath + '/:site', analyticsPageTitle );
}

function _getLayoutTitle( context ) {
	const state = context.store.getState();
	const siteId = getSelectedSiteId( state );
	const title = isJetpackSite( state, siteId ) ? 'Ads' : 'WordAds';
	switch ( context.params.section ) {
		case 'earnings':
			return i18n.translate( '%(wordads)s Earnings', { args: { wordads: title } } );
		case 'settings':
			return i18n.translate( '%(wordads)s Settings', { args: { wordads: title } } );
	}
}

export default {
	redirect: function( context ) {
		page.redirect( '/ads/earnings/' + context.params.site_id );
		return;
	},

	layout: function( context, next ) {
		const site = getSelectedSite( context.store.getState() );
		const pathSuffix = site ? '/' + site.slug : '';
		const layoutTitle = _getLayoutTitle( context );

		context.store.dispatch( setTitle( layoutTitle ) ); // FIXME: Auto-converted from the Flux setTitle action. Please use <DocumentHead> instead.

		if ( site && ! userCan( 'manage_options', site ) ) {
			page.redirect( '/stats' + pathSuffix );
			return;
		}

		if ( site && ! canAccessWordads( site ) ) {
			page.redirect( '/stats' + pathSuffix );
			return;
		}

		_recordPageView( context, layoutTitle );

		// Scroll to the top
		if ( typeof window !== 'undefined' ) {
			window.scrollTo( 0, 0 );
		}

		context.primary = React.createElement( Ads, {
			section: context.params.section,
			path: context.path,
		} );
		next();
	},
};
