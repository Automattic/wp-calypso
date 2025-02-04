import { QueryClientProvider } from '@tanstack/react-query';
import { Provider as ReduxProvider } from 'react-redux';
import CalypsoI18nProvider from 'calypso/components/calypso-i18n-provider';
import { RouteProvider } from 'calypso/components/route';
import { CalypsoReactQueryDevtools } from 'calypso/lib/react-query-devtools-helper';
import Layout from '../components/layout';

export { render, hydrate } from 'calypso/controller/web-util';

export const ProviderWrappedLayout = ( {
	store,
	queryClient,
	currentSection,
	currentRoute,
	currentQuery,
	primary,
	secondary,
	redirectUri,
} ) => {
	return (
		<CalypsoI18nProvider>
			<RouteProvider
				currentSection={ currentSection }
				currentRoute={ currentRoute }
				currentQuery={ currentQuery }
			>
				<QueryClientProvider client={ queryClient }>
					<ReduxProvider store={ store }>
						<Layout
							primary={ primary }
							secondary={ secondary }
							redirectUri={ redirectUri }
							sectionName="promote-post-i2"
							groupName="sites"
						/>
					</ReduxProvider>
					<CalypsoReactQueryDevtools />
				</QueryClientProvider>
			</RouteProvider>
		</CalypsoI18nProvider>
	);
};

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
		next();
	};
}

export const makeLayout = makeLayoutMiddleware( ProviderWrappedLayout );
