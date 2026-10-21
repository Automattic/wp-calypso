import type { SiteCapabilities } from '../site/types';

export interface ReadSiteSubscription {
	delivery_methods?: Record< string, unknown >;
}

export interface ReadSiteOptions {
	is_mapped_domain?: boolean;
	is_redirect?: boolean;
	unmapped_url?: string;
}

export interface ReadSiteResponse {
	ID: number;
	URL: string;
	name?: string;
	title?: string;
	description?: string;
	icon?: { ico: string; img: string; media_id?: number };
	feed_ID?: number;
	feed_URL?: string;
	is_following?: boolean;
	is_jetpack?: boolean;
	is_private?: boolean;
	is_blocked?: boolean;
	prefer_feed?: boolean;
	subscribers_count?: number;
	unseen_count?: number;
	capabilities?: SiteCapabilities;
	options?: ReadSiteOptions;
	subscription?: ReadSiteSubscription;
	// Derived fields populated by `adaptReadSite`.
	domain?: string;
	slug?: string;
	wpcom_url?: string;
}
