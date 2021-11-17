import config from '@automattic/calypso-config';
import { isTranslatedIncompletely } from '@automattic/languages';
import { getCurrentUser, isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { setSection } from 'calypso/state/ui/actions';
import { setLocale } from 'calypso/state/ui/language/actions';

const noop = () => {};

export function makeLayoutMiddleware( LayoutComponent ) {
	return ( context, next ) => {
		const { store, queryClient, section, pathname, query, primary, secondary } = context;

		// On server, only render LoggedOutLayout when logged-out.
		if ( ! ( context.isServerSide && isUserLoggedIn( context.store.getState() ) ) ) {
			context.layout = (
				<LayoutComponent
					store={ store }
					queryClient={ queryClient }
					currentSection={ section }
					currentRoute={ pathname }
					currentQuery={ query }
					primary={ primary }
					secondary={ secondary }
					redirectUri={ context.originalUrl }
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

export function setLocaleMiddleware( context, next ) {
	const currentUser = getCurrentUser( context.store.getState() );

	if ( context.params.lang ) {
		context.lang = context.params.lang;
	} else if ( currentUser ) {
		const shouldFallbackToDefaultLocale =
			currentUser.use_fallback_for_incomplete_languages &&
			isTranslatedIncompletely( currentUser.localeSlug );

		context.lang = shouldFallbackToDefaultLocale
			? config( 'i18n_default_locale_slug' )
			: currentUser.localeSlug;
	}

	context.store.dispatch( setLocale( context.lang || config( 'i18n_default_locale_slug' ) ) );
	next();
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
