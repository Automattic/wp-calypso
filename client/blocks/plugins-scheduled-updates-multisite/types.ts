import { SiteSlug } from 'calypso/types';

export type MultiSiteBaseParams = {
	plugins_number: number;
	frequency: 'daily' | 'weekly';
	hours: number;
	weekday?: number;
};

export type MultiSiteSuccessParams = MultiSiteBaseParams & {
	sites_count: number;
};

export type MultiSitesResults = {
	createdSiteSlugs: SiteSlug[];
	editedSiteSlugs: SiteSlug[];
	deletedSiteSlugs: SiteSlug[];
};
