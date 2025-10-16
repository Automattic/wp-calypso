import type { DomainSummary } from '../domains';

interface EmailSubscription {
	status: 'active' | 'pending' | 'suspended' | 'no_subscription';
}

export interface GoogleEmailSubscription extends EmailSubscription {
	total_user_count: number;
}

export interface TitanEmailSubscription extends EmailSubscription {
	order_id: number;
	maximum_mailbox_count: number;
}

export type SiteDomain = DomainSummary & {
	google_apps_subscription?: GoogleEmailSubscription | null;
	titan_mail_subscription?: TitanEmailSubscription | null;
};
