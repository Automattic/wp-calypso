/**
 * External dependencies
 */
import '@automattic/calypso-polyfills';
import React from 'react';
import ReactDom from 'react-dom';
import { BrowserRouter, Route, Switch, Redirect, generatePath } from 'react-router-dom';
import config from '../../config';

/**
 * Internal dependencies
 */
import { Gutenboard } from './gutenboard';
import { setupWpDataDebug } from './devtools';
import accessibleFocus from 'lib/accessible-focus';
import { path, Step } from './path';

/**
 * Style dependencies
 */
import 'assets/stylesheets/gutenboarding.scss';
import 'components/environment-badge/style.scss';

window.AppBoot = () => {
	if ( ! config.isEnabled( 'gutenboarding' ) ) {
		window.location.href = '/';
	} else {
		setupWpDataDebug();

		// Add accessible-focus listener.
		accessibleFocus();

		ReactDom.render(
			<BrowserRouter basename="gutenboarding">
				<Switch>
					<Route exact path={ path }>
						<Gutenboard />
					</Route>
					<Route>
						<Redirect to={ generatePath( path, { step: Step.IntentGathering } ) } />
					</Route>
				</Switch>
			</BrowserRouter>,
			document.getElementById( 'wpcom' )
		);
	}
};
