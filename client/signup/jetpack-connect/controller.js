/**
 * External Dependencies
 */
import ReactDom from 'react-dom';
import React from 'react';
import isEmpty from 'lodash/isEmpty';
import store from 'store';
import page from 'page';
import Debug from 'debug';

/**
 * Internal Dependencies
 */
import JetpackConnect from './index';
import jetpackConnectAuthorize from './authorize';
import { setSection } from 'state/ui/actions';
import { jetpackAuthorize } from './authorize-action';
import { renderWithReduxStore } from 'lib/react-helpers';

/**
 * Module variables
 */
const debug = new Debug( 'calypso:jetpack-connect:controller' );
let queryObject,
	autoAuthorizing = false;

export default {
	saveQueryObject( context, next ) {
		if ( ! isEmpty( context.query ) ) {
			debug( 'set initial query object', context.query );
			store.set( 'jetpack_connect_query', context.query );
			page.redirect( context.pathname );
			return;
		}

		queryObject = store.get( 'jetpack_connect_query' );

		next();
	},

	updateNonce( context, next ) {
		if ( ! isEmpty( context.query ) && context.query.update_nonce ) {
			debug( 'refreshing nonce', context.query.update_nonce );
			store.set(
				'jetpack_connect_query',
				Object.assign( {}, store.get( 'jetpack_connect_query' ), { _wp_nonce: context.query.update_nonce } )
			);
			debug( 'refreshed query object and redirect', store.get( 'jetpack_connect_query' ), context.pathname );
			page.redirect( context.pathname );
			return;
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

	authorize( context ) {
		if ( store.get( 'jetpack_connect_authorize_after_signup' ) ) {
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
		}

		context.store.dispatch( setSection( 'jetpackConnect', {
			hasSidebar: false
		} ) );

		ReactDom.render(
			React.createElement( jetpackConnectAuthorize, {
				path: context.path,
				locale: context.params.lang,
				queryObject: queryObject,
				autoAuthorizing: autoAuthorizing
			} ),
			document.getElementById( 'primary' )
		);
	}
};
