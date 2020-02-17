/**
 * External dependencies
 */
import '@automattic/calypso-polyfills';
import React from 'react';
import ReactDom from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import config from '../../config';

/**
 * Internal dependencies
 */
import { Gutenboard } from './gutenboard';
import { setupWpDataDebug } from './devtools';
import accessibleFocus from 'lib/accessible-focus';
import { getLanguageFile } from 'lib/i18n-utils/switch-locale';

/**
 * Style dependencies
 */
import 'assets/stylesheets/gutenboarding.scss';
import 'components/environment-badge/style.scss';
import { I18nProvider } from '@automattic/react-i18n';

window.AppBoot = async () => {
	if ( ! config.isEnabled( 'gutenboarding' ) ) {
		window.location.href = '/';
	} else {
		setupWpDataDebug();

		// Add accessible-focus listener.
		accessibleFocus();

		const localeData = await getLanguageFile( 'es' );
		ReactDom.render(
			<C initial="es" initialLocale={ localeData }>
				<BrowserRouter basename="gutenboarding">
					<Gutenboard />
				</BrowserRouter>
			</C>,
			document.getElementById( 'wpcom' )
		);
	}
};

const C: React.FunctionComponent< { initial: string; initialLocale: object } > = ( {
	children,
	initial,
	initialLocale,
} ) => {
	const [ [ l, ld ], setL ] = React.useState( [ initial, initialLocale ] );
	( window as any ).updateLocale = async ( nextL: string ) => {
		const nextLd = await getLanguageFile( nextL );
		setL( [ nextL, nextLd ] );
	};
	return (
		<I18nProvider locale={ l } localeData={ ld }>
			{ children }
		</I18nProvider>
	);
};
