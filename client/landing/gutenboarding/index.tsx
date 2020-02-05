/**
 * External dependencies
 */
import '@automattic/calypso-polyfills';
import React from 'react';
import ReactDom from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import config from '../../config';
import { setLocaleData } from '@wordpress/i18n';
import i18n from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { Gutenboard } from './gutenboard';
import { setupWpDataDebug } from './devtools';
import accessibleFocus from 'lib/accessible-focus';
/**
 * Style dependencies
 */
import 'assets/stylesheets/gutenboarding.scss';
import 'components/environment-badge/style.scss';

window.AppBoot = () => {
	if ( ! config.isEnabled( 'gutenboarding' ) ) {
		window.location.href = '/';
	} else {
		// JED locale comes in JS in a <script> tag. See `attachI18n` in client/server/render/index
		const i18nLocaleStringsObject = JSON.parse( window.i18nLocaleStrings );

		// This is what i18n-calypso needs to work
		i18n.setLocale( i18nLocaleStringsObject );
		// This is what @wordpress/i18n needs to work
		setLocaleData( i18nLocaleStringsObject );

		setupWpDataDebug();

		// Add accessible-focus listener.
		accessibleFocus();

		ReactDom.render(
			<BrowserRouter basename="gutenboarding">
				<Gutenboard />
			</BrowserRouter>,
			document.getElementById( 'wpcom' )
		);
	}
};
