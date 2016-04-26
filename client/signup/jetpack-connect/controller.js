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
import userFactory from 'lib/user';

/**
 * Module variables
 */
const debug = new Debug( 'calypso:jetpack-connect:controller' );
const userModule = userFactory();

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

	connect( context, next ) {
		context.primary = React.createElement( JetpackConnect, {
			path: context.path,
			context: context,
			locale: context.params.lang
		} );

		next();
	},

	authorizeForm( context, next ) {
		userModule.fetch();

		context.primary = React.createElement( jetpackConnectAuthorizeForm, {
			path: context.path,
			locale: context.params.lang,
			userModule: userModule
		} );

		next();
	}
};
