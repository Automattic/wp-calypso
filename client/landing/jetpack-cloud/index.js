/**
 * External dependencies
 */
import page from 'page';
import React from 'react';

/**
 * Internal dependencies
 */
import { makeLayout, render as clientRender } from 'controller';
import Home from './sections/home';

export default function () {
	const homeController = ( context, next ) => {
		context.primary = <Home />;
		next();
	};
	page( '/', homeController, makeLayout, clientRender );
}
