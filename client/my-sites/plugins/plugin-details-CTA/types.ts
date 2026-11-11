import type { PluginPeriodVariations } from 'calypso/data/marketplace/types';

/**
 * The fields the plugin details page reads from a normalized WordPress.org or
 * WordPress.com Marketplace plugin.
 */
export type PluginDetailsPlugin = {
	slug: string;
	name?: string;
	software_slug?: string;
	org_slug?: string;
	active?: boolean;
	fetched?: boolean;
	isMarketplaceProduct?: boolean;
	isSaasProduct?: boolean;
	saas_landing_page?: string;
	variations?: PluginPeriodVariations;
};
