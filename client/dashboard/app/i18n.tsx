import { defaultI18n } from '@wordpress/i18n';
import { I18nProvider as WPI18nProvider } from '@wordpress/react-i18n';
import { useEffect, useRef, useState, type PropsWithChildren } from 'react';
import { useAuth } from './auth';

async function fetchLocaleData( language: string ) {
	if ( language === 'en' ) {
		return [ language, undefined ];
	}

	try {
		const response = await fetch(
			`https://widgets.wp.com/languages/calypso/${ language }-v1.1.json`
		);

		return [ language, await response.json() ];
	} catch {
		// Fall back to `en` when fetching the language data fails. Without this
		// the i18n provider would be stuck forever in a non-loaded state.
		return [ 'en', undefined ];
	}
}

export function I18nProvider( { children }: PropsWithChildren ) {
	const [ loadedLocale, setLoadedLocale ] = useState< string | null >( null );
	const loadingLocaleRef = useRef< string | null >( null );
	const { user } = useAuth();

	const i18n = defaultI18n;
	const language = user.locale_variant || user.language || 'en';

	useEffect( () => {
		loadingLocaleRef.current = language;

		fetchLocaleData( language ).then( ( [ realLanguage, data ] ) => {
			// Activate the data only if no other language switch has run in the meantime
			if ( loadingLocaleRef.current !== language ) {
				return;
			}

			i18n.resetLocaleData( data );
			// `realLanguage` can be different from `language` when loading language data fails
			// and it falls back to `en`.
			setLoadedLocale( realLanguage );
		} );
	}, [ i18n, language ] );

	// Render the sub-tree only after the initial locale data are loaded. We don't want a
	// flash of `en` content on the initial render that's updated a moment later.
	if ( loadedLocale === null ) {
		return null;
	}

	return <WPI18nProvider i18n={ i18n } children={ children } />;
}
