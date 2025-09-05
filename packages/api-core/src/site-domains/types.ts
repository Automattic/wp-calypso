import type { DomainSummary } from '../domains';

interface EmailSubscription {
	status?: string;
}

export interface GoogleEmailSubscription extends EmailSubscription {}

export interface TitanEmailSubscription extends EmailSubscription {}

export type SiteDomain = Omit< DomainSummary, 'domain_status' > & {
	google_apps_subscription?: GoogleEmailSubscription | null;
	titan_mail_subscription?: TitanEmailSubscription | null;
};
