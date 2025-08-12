import wpcom from 'calypso/lib/wp';
import type { DomainSummary } from './domains';

interface EmailSubscription {
	status?: string;
}

export interface GoogleEmailSubscription extends EmailSubscription {}

export interface TitanEmailSubscription extends EmailSubscription {}

export type SiteDomain = Omit< DomainSummary, 'domain_status' > & {
	google_apps_subscription?: GoogleEmailSubscription | null;
	titan_mail_subscription?: TitanEmailSubscription | null;
};

export async function fetchSiteDomains( siteId: number ): Promise< SiteDomain[] > {
	const { domains } = await wpcom.req.get( {
		path: `/sites/${ siteId }/domains`,
		apiVersion: '1.2',
	} );

	return domains;
}

export async function setPrimaryDomain( siteId: number, domain: string ): Promise< SiteDomain > {
	return wpcom.req.post( `/sites/${ siteId }/domains/primary`, { domain } );
}
