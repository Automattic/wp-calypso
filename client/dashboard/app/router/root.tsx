import {
	queryClient,
	rawUserPreferencesQuery,
	userSettingsQuery,
	siteByIdQuery,
} from '@automattic/api-queries';
import { createRootRouteWithContext, redirect } from '@tanstack/react-router';
import { wpcomLink } from '../../utils/link';
import Root from '../root';
import NotFoundRoot from '../root/error';
import type { AppConfig } from '../context';

export type RootRouterContext = {
	config: AppConfig;
};

export const rootRoute = createRootRouteWithContext< RootRouterContext >()( {
	component: Root,
	notFoundComponent: NotFoundRoot,
	beforeLoad: async ( { location } ) => {
		if ( location.pathname !== '/' ) {
			return;
		}

		const userPreference = await queryClient.ensureQueryData( rawUserPreferencesQuery() );
		if ( userPreference[ 'sites-landing-page' ]?.useSitesAsLandingPage ) {
			return;
		}

		if ( userPreference[ 'reader-landing-page' ]?.useReaderAsLandingPage ) {
			throw redirect( { href: wpcomLink( '/reader' ), replace: true } );
		}

		const userSettings = await queryClient.ensureQueryData( userSettingsQuery() );
		if ( userSettings.primary_site_ID ) {
			let primarySite;
			try {
				primarySite = await queryClient.ensureQueryData(
					siteByIdQuery( userSettings.primary_site_ID )
				);
			} catch ( e ) {
				// Do nothing if the primary site is not available.
				return;
			}

			if (
				primarySite.options?.wpcom_admin_interface === 'wp-admin' &&
				primarySite.options?.admin_url
			) {
				throw redirect( { href: primarySite.options?.admin_url, replace: true } );
			}

			throw redirect( { href: wpcomLink( `/home/${ primarySite.slug }` ), replace: true } );
		}
	},
} );
