/**
 * External Dependencies
 */
import React from 'react';
import isEmpty from 'lodash/isEmpty';
import page from 'page';
import Debug from 'debug';

/**
 * Internal Dependencies
 */
import JetpackConnect from './index';
import jetpackConnectAuthorizeForm from './authorize-form';
import { setSection } from 'state/ui/actions';
import { renderWithReduxStore } from 'lib/react-helpers';
import { JETPACK_CONNECT_QUERY_SET, JETPACK_CONNECT_QUERY_UPDATE } from 'state/action-types';

/**
 * Module variables
 */
const debug = new Debug( 'calypso:jetpack-connect:controller' );
let autoAuthorize = false;

export default {
	saveQueryObject( context, next ) {
		if ( ! isEmpty( context.query ) && context.query.redirect_uri ) {
			debug( 'set initial query object', context.query );
			context.store.dispatch( { type: JETPACK_CONNECT_QUERY_SET, queryObject: context.query } );
			page.redirect( context.pathname );
		}

		if ( ! isEmpty( context.query ) && context.query.update_nonce ) {
			debug( 'updating nonce', context.query );
			context.store.dispatch( { type: JETPACK_CONNECT_QUERY_UPDATE, property: '_wp_nonce', value: context.query.update_nonce } );
			page.redirect( context.pathname );
		}

		next();
	},

	connect( context ) {
		context.store.dispatch( setSection( 'jetpackConnect', {
			hasSidebar: false
		} ) );

		renderWithReduxStore(
			React.createElement( JetpackConnect, {
				path: context.path,
				context: context,
				locale: context.params.lang
			} ),
			document.getElementById( 'primary' ),
			context.store
		);
	},

	authorizeForm( context ) {
		/*if ( store.get( 'jetpack_connect_authorize_after_signup' ) ) {
			debug( 'auto authorizing', context.query );
			autoAuthorizing = true;
			const authorizeCallback = error => {
				if ( error ) {
					debug( 'jetpack auto authorize error', error );
					return;
				}
				store.remove( 'jetpack_connect_query' );
				page( '/' );
			}
			store.remove( 'jetpack_connect_authorize_after_signup' );
			jetpackAuthorize( queryObject, authorizeCallback );
		}*/

		context.store.dispatch( setSection( 'jetpackConnect', {
			hasSidebar: false
		} ) );

		renderWithReduxStore(
			React.createElement( jetpackConnectAuthorizeForm, {
				path: context.path,
				locale: context.params.lang,
				autoAuthorize: autoAuthorize
			} ),
			document.getElementById( 'primary' ),
			context.store
		);
	}
};
