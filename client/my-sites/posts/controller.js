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
import { areAllSitesSingleUser } from 'state/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import { isJetpackSite, isSingleUserSite } from 'state/sites/selectors';
import { getCurrentUserId } from 'state/current-user/selectors';
import Posts from 'my-sites/posts/main';
import { setDocumentHeadTitle as setTitle } from 'state/document-head/actions';

export default {
	posts: function( context, next ) {
		const state = context.store.getState();
		const siteId = getSelectedSiteId( state );
		const author = context.params.author === 'my' ? getCurrentUserId( state ) : null;
		let search = context.query.s || '';
		const category = context.query.category;
		const tag = context.query.tag;

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

		debug( 'author: `%s`', author );

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

		context.primary = React.createElement( Posts, {
			context,
			author,
			statusSlug: context.params.status,
			search,
			category,
			tag,
		} );
		next();
	},
};
