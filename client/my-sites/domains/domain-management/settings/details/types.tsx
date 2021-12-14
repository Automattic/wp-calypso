import type { ResponseDomain } from 'calypso/lib/domains/types';
import type { Purchase } from 'calypso/lib/purchases/types';
import type { SiteData } from 'calypso/state/ui/selectors/site-data';

export type DetailsCardPassedProps = {
	domain: ResponseDomain;
	isLoadingPurchase: boolean;
	purchase: Purchase | null;
	selectedSite: SiteData;
};

export type DetailsCardConnectedProps = {
	isDomainOnlySite: boolean | null;
	redemptionProduct: any;
};

export type DetailsCardProps = DetailsCardPassedProps & DetailsCardConnectedProps;
