import { ReactElement } from 'react';
import { TermLength } from './utils';
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
	cart?: any;
	cartDomainName?: string;
	selectedSite?: Site | null;
	currencyCode?: string | null;
	currentRoute?: string;
	detailsExpanded: boolean;
	domain?: any;
	domainName?: string;
	domainsWithForwards?: any[];
	gSuiteProductMonthly?: any;
	gSuiteProductYearly?: any;
	hasCartDomain?: boolean;
	isGSuiteSupported?: boolean;
	productsList?: string[];
	requestingSiteDomains?: boolean;
	selectedDomainName: string;
	shoppingCartManager?: any;
	source: string;
	termLength: TermLength;
	titanMailMonthlyProduct?: any;
	titanMailAnnuallyProduct?: any;
	onExpandedChange?: ( providerKey: string, expanded: boolean ) => void;
};
