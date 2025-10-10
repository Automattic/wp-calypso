import type { DomainSummary } from '../domains';

interface EmailSubscription {
	status: 'active' | 'pending' | 'suspended';
}

export interface GoogleEmailSubscription extends EmailSubscription {}

export interface TitanEmailSubscription extends EmailSubscription {
	order_id: number;
}

export type SiteDomain = DomainSummary & {
	google_apps_subscription?: GoogleEmailSubscription | null;
	titan_mail_subscription?: TitanEmailSubscription | null;
};
