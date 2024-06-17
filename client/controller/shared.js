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
			renderHeaderSection,
			showGdprBanner,
			cachedMarkup,
		} = context;
		// Markup exists in the cache; no need to do extra work which won't be used.
		if ( cachedMarkup ) {
			return next();
		}

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
					renderHeaderSection={ renderHeaderSection }
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

export function setLocaleMiddleware( param = 'lang' ) {
	return ( context, next ) => {
		const queryLocale = context.query[ param ];
		if ( queryLocale ) {
			context.lang = queryLocale;
			context.store.dispatch( setLocale( queryLocale ) );
		}

		const paramsLocale = context.params[ param ];
		if ( paramsLocale ) {
			context.lang = paramsLocale;
			context.store.dispatch( setLocale( paramsLocale ) );
		}
		next();
	};
}

/**
 * Composes multiple handlers into one.
 * @param {Object[]} handlers { ...( context, Function ) => void } - A list of route handlers to compose
 * @returns {Function} { ( context, Function ) => void } - A new route handler that executes the handlers in succession
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
