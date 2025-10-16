import type { DomainSummary } from '../domains';

interface EmailSubscription {
	status: 'active' | 'pending' | 'suspended' | 'no_subscription' | 'other_provider';
}

export interface GoogleEmailSubscription extends EmailSubscription {}

export interface TitanEmailSubscription extends EmailSubscription {
	order_id: number;
	is_eligible_for_introductory_offer: boolean;
}

export type SiteDomain = DomainSummary & {
	google_apps_subscription?: GoogleEmailSubscription | null;
	titan_mail_subscription?: TitanEmailSubscription | null;
};
