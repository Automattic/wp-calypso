/**
 * External dependencies
 */

import page from 'page';
import React from 'react';

/**
 * Internal dependencies
 */
import reducer from './state/reducer';
import HelloDollyPage from './hello-dolly-page';
import { navigation, siteSelection } from 'my-sites/controller';
import { makeLayout, render as clientRender } from 'controller';

const render = ( context, next ) => {
	context.primary = <HelloDollyPage />;
	next();
};

export default async function ( _, addReducer ) {
	await addReducer( [ 'extensions', 'helloDolly' ], reducer );

	page( '/hello-dolly/:site?', siteSelection, navigation, render, makeLayout, clientRender );
}
