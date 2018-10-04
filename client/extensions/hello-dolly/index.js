/** @format */

/**
 * External dependencies
 */

import page from 'page';
import React from 'react';

/**
 * Internal dependencies
 */
import HelloDollyPage from './hello-dolly-page';
import { navigation, siteSelection } from 'my-sites/controller';
import { makeLayout, render as clientRender } from 'controller';

const render = ( context, next ) => {
	context.primary = <HelloDollyPage />;
	next();
};

export default function() {
	page( '/hello-dolly/:site?', siteSelection, navigation, render, makeLayout, clientRender );
}
