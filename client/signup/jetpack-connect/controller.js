/**
 * External Dependencies
 */
import ReactDom from 'react-dom';
import React from 'react';
import isEmpty from 'lodash/isEmpty';

/**
 * Internal Dependencies
 */
import JetpackConnect from './index';
import jetpackConnectAuthorize from './authorize';
import { setSection } from 'state/ui/actions';

/**
 * Module variables
 */
let queryObject;

export default {
	saveQueryObject( context, next ) {
		if ( ! isEmpty( context.query ) ) {
			queryObject = context.query;
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
		context.store.dispatch( setSection( 'jetpackConnect', {
			hasSidebar: false
		} ) );

		ReactDom.render(
			React.createElement( jetpackConnectAuthorize, {
				path: context.path,
				locale: context.params.lang,
				queryObject: queryObject
			} ),
			document.getElementById( 'primary' )
		);
	}
};
