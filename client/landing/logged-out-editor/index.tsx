/**
 * External dependencies
 */
import '@automattic/calypso-polyfills';
import React, { StrictMode } from 'react';
import { render } from 'react-dom';
import { I18nProvider } from '@automattic/react-i18n';
import { LocaleProvider } from '@automattic/i18n-utils';
import { registerCoreBlocks } from '@wordpress/block-library';
import config from 'calypso/config';
import 'calypso/assets/stylesheets/logged-out-editor.scss';
import 'calypso/components/environment-badge/style.scss';
import 'calypso/types';

/**
 * Internal dependencies
 */
import Editor from './components/loe-editor';
import { bootstrapUser, bootstrapEditorSettings } from './bootstrap';
import './styles.scss';

const DEFAULT_LOCALE_SLUG: string = config( 'i18n_default_locale_slug' );

window.AppBoot = () => {
	setupDebugging();
	registerCoreBlocks();
	bootstrapUser();

	const editorSettings = bootstrapEditorSettings();

	let localeSlug = DEFAULT_LOCALE_SLUG;
	let localeData = undefined;
	if ( window.i18nLocaleStrings ) {
		localeData = JSON.parse( window.i18nLocaleStrings );
		localeSlug = localeData[ '' ].localeSlug;
	}

	render(
		<StrictMode>
			<I18nProvider localeData={ localeData }>
				<LocaleProvider localeSlug={ localeSlug }>
					<Editor settings={ editorSettings } />
				</LocaleProvider>
			</I18nProvider>
		</StrictMode>,
		document.getElementById( 'wpcom' )
	);
};

function setupDebugging() {
	if ( process.env.NODE_ENV === 'production' || typeof window !== 'object' ) {
		return;
	}

	const debugWindow = ( window as any ) as { wp: undefined | Record< string, any > };

	if ( ! debugWindow.wp ) {
		debugWindow.wp = {};
	}
	if ( ! debugWindow.wp.data ) {
		debugWindow.wp.data = require( '@wordpress/data' );
	}
}
