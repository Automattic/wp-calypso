import { defaultI18n } from '@wordpress/i18n';
import { I18nProvider as WPI18nProvider } from '@wordpress/react-i18n';
import { useEffect, useState, type PropsWithChildren } from 'react';
import { useAuth } from './auth';

async function fetchLocaleData( language: string, signal: AbortSignal ) {
	if ( language === 'en' ) {
		return [ language, undefined ];
	}

	try {
		const response = await fetch(
			`https://widgets.wp.com/languages/calypso/${ language }-v1.1.json`,
			{ signal }
		);

		return [ language, await response.json() ];
	} catch ( error ) {
		// Only fall back to `en` when the error is not an abort
		if ( error instanceof Error && error.name === 'AbortError' ) {
			throw error;
		}

		// Fall back to `en` when fetching the language data fails. Without this
		// the i18n provider would be stuck forever in a non-loaded state.
		return [ 'en', undefined ];
	}
}

// Determine the locale to use. The current implementation reads the logged-in user's
// locale, but it can be made more flexible and support multiple sources. E.g., a locale
// slug in the route path.
function useLocaleSlug() {
	const { user } = useAuth();
	return user.locale_variant || user.language || 'en';
}

export function I18nProvider( { children }: PropsWithChildren ) {
	const language = useLocaleSlug();
	const [ loadedLocale, setLoadedLocale ] = useState< string | null >( null );

	const i18n = defaultI18n;

	useEffect( () => {
		const abortController = new AbortController();

		fetchLocaleData( language, abortController.signal )
			.then( ( [ realLanguage, data ] ) => {
				i18n.resetLocaleData( data );
				// `realLanguage` can be different from `language` when loading language data fails
				// and it falls back to `en`.
				setLoadedLocale( realLanguage );
			} )
			.catch( () => {
				// Ignore abort errors as they are expected during cleanup
			} );

		return () => {
			abortController.abort();
		};
	}, [ i18n, language ] );

	// Render the sub-tree only after the initial locale data are loaded. We don't want a
	// flash of `en` content on the initial render that's updated a moment later.
	if ( loadedLocale === null ) {
		return null;
	}

	return <WPI18nProvider i18n={ i18n } children={ children } />;
}
