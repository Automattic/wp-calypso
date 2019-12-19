/**
 * External dependencies
 */
import React from 'react';
import ReactDom from 'react-dom';
import { BrowserRouter } from 'react-router-dom';

/**
 * Internal dependencies
 */
import { Gutenboard } from './gutenboard';

/**
 * Style dependencies
 */
import 'assets/stylesheets/gutenboarding.scss';
import 'components/environment-badge/style.scss';

window.AppBoot = () => {
	// @TODO: Add replacements for redirectIfNotEnabled, wpDataDebugMiddleware
	ReactDom.render(
		<BrowserRouter basename="gutenboarding">
			<Gutenboard />
		</BrowserRouter>,
		document.getElementById( 'wpcom' )
	);
};
