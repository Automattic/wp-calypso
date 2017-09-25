/**
 * External Dependencies
 */
import page from 'page';

import React from 'react';
import debugFactory from 'debug';
const debug = debugFactory( 'calypso:my-sites:posts' );
import i18n from 'i18n-calypso';

/**
 * Internal Dependencies
 */
import route from 'lib/route';

import analytics from 'lib/analytics';
import titlecase from 'to-title-case';
import trackScrollPage from 'lib/track-scroll-page';
import { setDocumentHeadTitle as setTitle } from 'state/document-head/actions';

import { renderWithReduxStore } from 'lib/react-helpers';
import { areAllSitesSingleUser } from 'state/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import { isJetpackSite, isSingleUserSite } from 'state/sites/selectors';
import { getCurrentUserId } from 'state/current-user/selectors';

import Posts from 'my-sites/posts/main';

export default {

	posts: function( context ) {
		const state = context.store.getState();
		const siteId = getSelectedSiteId( state );

		let siteID = route.getSiteFragment( context.path ), author = ( context.params.author === 'my' ) ? getCurrentUserId( state ) : null, statusSlug = ( author ) ? context.params.status : context.params.author, search = context.query.s, category = context.query.category, tag = context.query.tag, basePath = route.sectionify( context.path ), analyticsPageTitle = 'Blog Posts', baseAnalyticsPath;

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

		statusSlug = ( ! statusSlug || statusSlug === 'my' || statusSlug === siteID )
			? ''
			: statusSlug;
		debug( 'statusSlug: `%s`', statusSlug );

		search = ( 'undefined' !== typeof search ) ? search : '';
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

		renderWithReduxStore(
			React.createElement( Posts, {
				context,
				author,
				statusSlug,
				search,
				category,
				tag,
				trackScrollPage: trackScrollPage.bind(
					null,
					baseAnalyticsPath,
					analyticsPageTitle,
					'Posts'
				)
			} ),
			'primary',
			context.store
		);
	}
};
