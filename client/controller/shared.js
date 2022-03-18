import { getLanguage } from 'calypso/lib/i18n-utils/utils';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { setSection } from 'calypso/state/ui/actions';
import { setLocale } from 'calypso/state/ui/language/actions';

const noop = () => {};

export function makeLayoutMiddleware( LayoutComponent ) {
	return ( context, next ) => {
		const {
			i18n,
			store,
			queryClient,
			section,
			pathname,
			query,
			primary,
			secondary,
			showGdprBanner,
		} = context;

		// On server, only render LoggedOutLayout when logged-out.
		if ( ! ( context.isServerSide && isUserLoggedIn( context.store.getState() ) ) ) {
			context.layout = (
				<LayoutComponent
					i18n={ i18n }
					store={ store }
					queryClient={ queryClient }
					currentSection={ section }
					currentRoute={ pathname }
					currentQuery={ query }
					primary={ primary }
					secondary={ secondary }
					redirectUri={ context.originalUrl }
					showGdprBanner={ showGdprBanner }
				/>
			);
		}
		next();
	};
}

export function setSectionMiddleware( section ) {
	return ( context, next = noop ) => {
		// save the section in context
		context.section = section;

		// save the section to Redux, too (poised to become legacy)
		context.store.dispatch( setSection( section ) );
		next();
	};
}

function browserLocaleSuggestion() {
	if ( typeof window === 'object' && 'languages' in window.navigator ) {
		for ( const langSlug of window.navigator.languages ) {
			const language = getLanguage( langSlug.toLowerCase() );
			if ( language ) {
				return language.langSlug;
			}
		}
	}

	return null;
}

function setContextLanguage( context, localeSlug, localeVariant ) {
	context.lang = localeVariant || localeSlug;
	context.store.dispatch( setLocale( localeSlug, localeVariant ) );
}

export function setLocaleMiddleware( param = 'lang' ) {
	return ( context, next ) => {
		const paramsLocale = context.params[ param ];
		if ( paramsLocale ) {
			const language = getLanguage( paramsLocale );
			if ( language.parentLangSlug ) {
				setContextLanguage( context, language.parentLangSlug, language.langSlug );
			} else {
				setContextLanguage( context, language.langSlug );
			}
		} else {
			const browserLang = browserLocaleSuggestion();
			if ( browserLang ) {
				setContextLanguage( context, browserLang );
			}
		}

		next();
	};
}

/**
 * Composes multiple handlers into one.
 *
 * @param { ...( context, Function ) => void } handlers - A list of route handlers to compose
 * @returns  { ( context, Function ) => void } - A new route handler that executes the handlers in succession
 */
export function composeHandlers( ...handlers ) {
	return ( context, next ) => {
		const it = handlers.values();
		function handleNext() {
			const nextHandler = it.next().value;
			if ( ! nextHandler ) {
				next();
			} else {
				nextHandler( context, handleNext );
			}
		}
		handleNext();
	};
}
