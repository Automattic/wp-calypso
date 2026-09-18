import { useLocale } from '@automattic/i18n-utils';
import { useSiteData } from 'calypso/landing/stepper/hooks/use-site-data';
import { useSubmitMigrationTicket } from 'calypso/landing/stepper/hooks/use-submit-migration-ticket';
import { useStaticSiteImportSource } from './use-source';

/** Hands the site over to the migrations team, with `context` explaining why. */
export const useStaticSiteImportTicket = () => {
	const locale = useLocale();
	const { siteSlug } = useSiteData();
	const { sourceUrl } = useStaticSiteImportSource();
	const { sendTicketAsync, isPending, isError } = useSubmitMigrationTicket();

	const sendTicket = ( context: string ) =>
		sendTicketAsync( { locale, blog_url: siteSlug, from_url: sourceUrl, context } );

	return { sendTicket, isPending, isError };
};
