import { ReactElement } from 'react';
import { IntervalLength } from './utils';
import type { Site } from 'calypso/my-sites/scan/types';
import type { TranslateResult } from 'i18n-calypso';

export interface ProviderCard {
	additionalPriceInformation?: TranslateResult;
	badge?: ReactElement;
	billingPeriod?: TranslateResult;
	description: TranslateResult;
	detailsExpanded?: boolean;
	discount?: ReactElement | null;
	footerBadge?: ReactElement | null;
	expandButtonLabel: TranslateResult;
	features: TranslateResult[];
	formFields?: ReactElement;
	logo?: ReactElement | { path: string; className?: string };
	onExpandedChange?: ( providerKey: string, expanded: boolean ) => void;
	priceBadge?: ReactElement | TranslateResult;
	productName: TranslateResult;
	providerKey: string;
	showExpandButton?: boolean;
}

export type EmailProvidersStackedCardProps = {
	comparisonContext: string;
	cartDomainName?: string;
	selectedSite?: Site | null;
	currencyCode?: string | null;
	currentRoute?: string;
	detailsExpanded: boolean;
	domain?: { name: string; currentUserCanAddEmail: boolean };
	domainName?: string;
	hasCartDomain?: boolean;
	isGSuiteSupported?: boolean;
	productsList?: Record< string, { product_id: number } >;
	requestingSiteDomains?: boolean;
	selectedDomainName: string;
	shoppingCartManager?: any;
	source: string;
	intervalLength: IntervalLength;
	onExpandedChange?: ( providerKey: string, expand: boolean ) => void;
};
