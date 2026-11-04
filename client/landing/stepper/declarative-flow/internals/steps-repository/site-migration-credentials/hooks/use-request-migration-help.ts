import { useLocale } from '@automattic/i18n-utils';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { useSiteSlugParam } from 'calypso/landing/stepper/hooks/use-site-slug-param';
import { useSubmitMigrationTicket } from 'calypso/landing/stepper/hooks/use-submit-migration-ticket';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';

/**
 * Asking for help reaches our team through the site's migration ticket. The customer moves on even if it can't be
 * opened or noted.
 */
export function useRequestMigrationHelp( onDone: () => void ) {
	const locale = useLocale();
	const siteSlug = useSiteSlugParam() ?? '';
	const fromUrl = useQuery().get( 'from' ) || '';
	const { sendTicket } = useSubmitMigrationTicket( {
		onSuccess: () => {
			recordTracksEvent( 'calypso_migration_credentials_ticket_submit_success', {
				blog_url: siteSlug,
				from_url: fromUrl,
			} );
		},
		onError: ( error ) => {
			recordTracksEvent( 'calypso_migration_credentials_ticket_submit_error', {
				blog_url: siteSlug,
				from_url: fromUrl,
				error: error.message,
			} );
		},
	} );

	return () =>
		sendTicket( { locale, from_url: fromUrl, blog_url: siteSlug }, { onSettled: onDone } );
}
