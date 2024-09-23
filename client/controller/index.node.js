import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider as ReduxProvider } from 'react-redux';
import CalypsoI18nProvider from 'calypso/components/calypso-i18n-provider';
import { RouteProvider } from 'calypso/components/route';
import LayoutLoggedOut from 'calypso/layout/logged-out';
import { makeLayoutMiddleware } from './shared.js';
import { ssrSetupLocaleMiddleware } from './ssr-setup-locale.js';

/**
 * Re-export
 */
export { setSectionMiddleware, setLocaleMiddleware } from './shared.js';

/**
 * Server side rendering (SSR) is used exclusively for logged out users. Normally, for
 * logged out users, we wouldn't need the react-query QueryClientProvider. This is
 * because only logged-in users have access to REST endpoints, hence no fetches made by
 * react-query, and no need for the QueryClientProvider.
 *
 * We, however add it here in order to prevent errors when server side rendering (SSR).
 * For context, there are components shared between logged-in and logged-out views.
 * If ProviderWrappedLoggedOutLayout initializes content that contains a useQuery call
 * in one of these shared components (even if it's not enabled), SSR will throw an error
 * regarding an inaccessible QueryClient.
 *
 * Ideally, useQuery would only be called for logged-in routes on a site, but ensuring
 * that will require more planning and deliberate refactoring.
 *
 * https://github.com/Automattic/wp-calypso/pull/56916#issuecomment-942730743
 */
const ProviderWrappedLoggedOutLayout = ( {
	store,
	queryClient = new QueryClient(),
	currentSection,
	currentRoute,
	currentQuery,
	primary,
	secondary,
	renderHeaderSection,
	redirectUri,
	i18n,
	showGdprBanner,
} ) => (
	<CalypsoI18nProvider i18n={ i18n }>
		<RouteProvider
			currentSection={ currentSection }
			currentRoute={ currentRoute }
			currentQuery={ currentQuery }
		>
			<QueryClientProvider client={ queryClient }>
				<ReduxProvider store={ store }>
					<LayoutLoggedOut
						primary={ primary }
						secondary={ secondary }
						renderHeaderSection={ renderHeaderSection }
						redirectUri={ redirectUri }
						showGdprBanner={ showGdprBanner }
					/>
				</ReduxProvider>
			</QueryClientProvider>
		</RouteProvider>
	</CalypsoI18nProvider>
);

/**
 * @param {Object} context -- Middleware context
 * @param {Function} next -- Call next middleware in chain
 *
 * Produce a `LayoutLoggedOut` element in `context.layout`, using
 * `context.primary` and `context.secondary` to populate it.
 */
export const makeLayout = makeLayoutMiddleware( ProviderWrappedLoggedOutLayout );

export const ssrSetupLocale = ssrSetupLocaleMiddleware();

/**
 * These functions are not used by Node. It is here to provide an APi compatible with `./index.web.js`
 */
export const redirectWithoutLocaleParamInFrontIfLoggedIn = () => {};
export const redirectInvalidLanguage = () => {};
export const redirectLoggedOut = () => {};
export const redirectLoggedOutToSignup = () => {};
export const redirectToDashboard = () => {};
export const redirectMyJetpack = () => {};
export const redirectWithoutLocaleParamIfLoggedIn = () => {};
// eslint-disable-next-line no-unused-vars
export const redirectIfCurrentUserCannot = ( capability ) => () => {};
export const redirectIfP2 = () => {};
export const redirectIfJetpackNonAtomic = () => {};
export const redirectToHostingPromoIfNotAtomic = () => {};
// eslint-disable-next-line no-unused-vars
export const render = ( context ) => {};
export const ProviderWrappedLayout = () => null;
export const notFound = () => null;
export const setSelectedSiteIdByOrigin = () => {};
