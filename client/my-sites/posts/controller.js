/** @format */

/**
 * External dependencies
 */

import page from 'page';
import React from 'react';
import debugFactory from 'debug';
const debug = debugFactory( 'calypso:my-sites:posts' );
import i18n from 'i18n-calypso';

/**
 * Internal Dependencies
 */
import { getSiteFragment, sectionify } from 'lib/route';
import analytics from 'lib/analytics';
import titlecase from 'to-title-case';
import trackScrollPage from 'lib/track-scroll-page';
import { setDocumentHeadTitle as setTitle } from 'state/document-head/actions';
import { areAllSitesSingleUser } from 'state/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import { isJetpackSite, isSingleUserSite } from 'state/sites/selectors';
import { getCurrentUserId } from 'state/current-user/selectors';
import Posts from 'my-sites/posts/main';

export default {
	posts: function( context, next ) {
		const state = context.store.getState();
		const siteId = getSelectedSiteId( state );

		const siteID = getSiteFragment( context.path );
		const author = context.params.author === 'my' ? getCurrentUserId( state ) : null;
		let statusSlug = author ? context.params.status : context.params.author;
		let search = context.query.s || '';
		const category = context.query.category;
		const tag = context.query.tag;
		const basePath = sectionify( context.path );
		let analyticsPageTitle = 'Blog Posts';
		let baseAnalyticsPath;

		function shouldRedirectMyPosts() {
			if ( ! author ) {
				return false;
			}
			if ( areAllSitesSingleUser( state ) ) {
				return true;
			}
			if ( isSingleUserSite( state, siteId ) || isJetpackSite( state, siteId ) ) {
				return true;
			}
		}

		debug( 'siteID: `%s`', siteID );
		debug( 'author: `%s`', author );

		statusSlug = ! statusSlug || statusSlug === 'my' || statusSlug === siteID ? '' : statusSlug;
		debug( 'statusSlug: `%s`', statusSlug );

		// Disable search in all-sites mode because it doesn't work.
		if ( ! siteId ) {
			search = '';
		}

		debug( 'search: `%s`', search );

		if ( shouldRedirectMyPosts() ) {
			page.redirect( context.path.replace( /\/my\b/, '' ) );
			return;
		}

		// FIXME: Auto-converted from the Flux setTitle action. Please use <DocumentHead> instead.
		context.store.dispatch( setTitle( i18n.translate( 'Blog Posts', { textOnly: true } ) ) );

		if ( siteID ) {
			baseAnalyticsPath = basePath + '/:site';
		} else {
			baseAnalyticsPath = basePath;
		}

		if ( statusSlug.length ) {
			analyticsPageTitle += ' > ' + titlecase( statusSlug );
		} else {
			analyticsPageTitle += ' > Published';
		}

		analytics.pageView.record( baseAnalyticsPath, analyticsPageTitle );

		context.primary = React.createElement( Posts, {
			context,
			author,
			statusSlug,
			search,
			category,
			tag,
			trackScrollPage: trackScrollPage.bind( null, baseAnalyticsPath, analyticsPageTitle, 'Posts' ),
		} );
		next();
	},
};
