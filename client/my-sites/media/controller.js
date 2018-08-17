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
import MediaComponent from 'my-sites/media/main';
import SingleMediaComponent from 'my-sites/media/single';
import { setDocumentHeadTitle as setTitle } from 'state/document-head/actions';
import { getSiteFragment } from 'lib/route';

export default {
	media: function( context, next ) {
		if ( ! getSiteFragment( context.path ) ) {
			return page.redirect( '/media' );
		}

		// Page Title
		// FIXME: Auto-converted from the Flux setTitle action. Please use <DocumentHead> instead.
		context.store.dispatch( setTitle( i18n.translate( 'Media', { textOnly: true } ) ) );

		// Render
		context.primary = React.createElement( MediaComponent, {
			filter: context.params.filter,
			search: context.query.s,
		} );
		next();
	},
	singleMedia: function( context, next ) {
		if ( ! getSiteFragment( context.path ) ) {
			return page.redirect( '/media' );
		}
		// Render
		context.primary = React.createElement( SingleMediaComponent, {
			attachment: context.params.attachment,
		} );
		next();
	},
};
