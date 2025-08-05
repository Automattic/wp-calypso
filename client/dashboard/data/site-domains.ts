import wpcom from 'calypso/lib/wp';
import type { DomainSummary } from './domains';

export type EmailCost = {
	amount: number;
	currency: string;
	text: string;
};

interface EmailSubscription {
	expiryDate?: string;
	hasExpectedDnsRecords?: boolean | null;
	isEligibleForIntroductoryOffer?: boolean;
	ownedByUserId?: number;
	purchaseCostPerMailbox?: EmailCost | null;
	renewalCostPerMailbox?: EmailCost | null;
	status?: string;
}

export type GoogleEmailSubscription = EmailSubscription & {
	expiryDate?: string;
	pendingTosAcceptance?: boolean;
	productSlug?: string;
	subscribedDate?: string;
	subscriptionId?: string;
	totalUserCount?: number;
};

export type TitanEmailSubscription = EmailSubscription & {
	appsUrl?: string;
	maximumMailboxCount?: number;
	numberOfMailboxes?: number;
	orderId?: number;
	productSlug?: string;
	subscriptionId?: number | null;
};

export type SiteDomain = Omit< DomainSummary, 'domain_status' > & {
	googleAppsSubscription?: GoogleEmailSubscription | null;
	titanMailSubscription?: TitanEmailSubscription | null;
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
