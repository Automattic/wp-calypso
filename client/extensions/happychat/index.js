/**
 * External dependencies
 */
import page from 'page';
import React from 'react';

/**
 * Internal dependencies
 */
import { renderPage } from 'lib/react-helpers';
import controller from 'me/controller';
import Happychat from './happychat';

const render = ( context ) => {
	renderPage( context, <Happychat /> );
};

export default function() {
	page( '/me/chat', controller.sidebar, render );
}
