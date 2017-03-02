/**
 * External dependencies
 */
import page from 'page';
import React from 'react';

/**
 * Internal dependencies
 */
import HelloDollyPage from './hello-dolly-page';
import { renderPage } from 'lib/react-helpers';
import { navigation, siteSelection } from 'my-sites/controller';

const render = ( context ) => {
	renderPage( context, <HelloDollyPage /> );
};

export default function() {
	page( '/hello-dolly/:site?', siteSelection, navigation, render );
}
