import type { ResponseDomain } from 'calypso/lib/domains/types';
import type { Purchase } from 'calypso/lib/purchases/types';
import type { SiteData } from 'calypso/state/ui/selectors/site-data';

export type DetailsCardProps = {
	domain: ResponseDomain;
	isLoadingPurchase: boolean;
	purchase: Purchase | null;
	selectedSite: SiteData;
};
