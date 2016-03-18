/**
 * External Dependencies
 */
import ReactDom from 'react-dom';
import React from 'react';
import isEmpty from 'lodash/isEmpty';
import store from 'store';
import page from 'page';

/**
 * Internal Dependencies
 */
import JetpackConnect from './index';
import jetpackConnectAuthorize from './authorize';
import { setSection } from 'state/ui/actions';
import { jetpackAuthorize } from './authorize-action';

/**
 * Module variables
 */
let queryObject,
	autoConnecting = false;

export default {
	saveQueryObject( context, next ) {
		if ( ! isEmpty( context.query ) ) {
			store.set( 'jetpack_connect_query', context.query );
			page.redirect( context.pathname );
			return;
		}

		queryObject = store.get( 'jetpack_connect_query' );

		next();
	},

	updateNonce( context, next ) {
		if ( ! isEmpty( context.query ) && context.query.update_nonce ) {
			store.set(
				'jetpack_connect_query',
				Object.assign( {}, store.get( 'jetpack_connect_query' ), { _wp_nonce: context.query.update_nonce } )
			);
			page.redirect( context.pathname );
			return;
		}

		next();
	},

	connect( context ) {
		context.store.dispatch( setSection( 'jetpackConnect', {
			hasSidebar: false
		} ) );

		ReactDom.render(
			React.createElement( JetpackConnect, {
				path: context.path,
				locale: context.params.lang
			} ),
			document.getElementById( 'primary' )
		);
	},

	authorize( context ) {
		if ( store.get( 'jetpack_connect_authorize_after_signup' ) ) {
			autoConnecting = true;
			const authorizeCallback = error => {
				if ( error ) {
					console.log( error );
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
				autoConnecting: autoConnecting
			} ),
			document.getElementById( 'primary' )
		);
	}
};
