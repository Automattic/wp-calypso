export interface SiteUrlAnalysis {
	url: string;
	platform: string;
	platform_data?: {
		is_wpcom?: boolean;
		is_pressable?: boolean;
		is_wpengine?: boolean;
		name?: string;
	};
	meta?: { title?: string | null; favicon?: string | null };
}

export interface SiteHostingDiscovery {
	domain: string;
	hosting_provider?: { slug: string; name: string; is_cdn: boolean } | null;
}

export interface SiteDnsDiscovery {
	domain: string;
	dns: Array< { type: string; host: string; ip?: string; ipv6?: string; target?: string } >;
}
