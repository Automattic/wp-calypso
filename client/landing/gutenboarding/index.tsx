/**
 * External dependencies
 */
import '@automattic/calypso-polyfills';
import React from 'react';
import ReactDom from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import config from '../../config';
import { setLocaleData } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { Gutenboard } from './gutenboard';
import { setupWpDataDebug } from './devtools';
import accessibleFocus from 'lib/accessible-focus';
import SetupUserLanguage from './setup-user-language';

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
		const maybeLocaleDataString = ( window as { i18nLocaleStrings?: string } ).i18nLocaleStrings;
		if ( maybeLocaleDataString ) {
			setLocaleData( JSON.parse( maybeLocaleDataString ) );
		}

		// Add accessible-focus listener.
		accessibleFocus();

		ReactDom.render(
			<>
				<SetupUserLanguage />
				<BrowserRouter basename="gutenboarding">
					<Gutenboard />
				</BrowserRouter>
			</>,
			document.getElementById( 'wpcom' )
		);
	}
};
