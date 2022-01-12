import { ReactElement } from 'react';
import { IntervalLength } from 'calypso/my-sites/email/email-providers-comparison/interval-length';
import type { Site } from 'calypso/my-sites/scan/types';
import type { TranslateResult } from 'i18n-calypso';

export interface ProviderCard {
	additionalPriceInformation?: TranslateResult;
	badge?: ReactElement;
	billingPeriod?: TranslateResult;
	children?: any;
	className?: string;
	description: TranslateResult;
	detailsExpanded?: boolean;
	discount?: ReactElement | null;
	expandButtonLabel: TranslateResult;
	features: TranslateResult[];
	footerBadge?: ReactElement | null;
	formFields?: ReactElement;
	logo?: ReactElement | { path: string; className?: string };
	onExpandedChange?: ( providerKey: string, expanded: boolean ) => void;
	priceBadge?: ReactElement | TranslateResult | null;
	productName: TranslateResult;
	providerKey: string;
	showExpandButton?: boolean;
}

export type EmailProvidersStackedCardProps = {
	cart?: any;
	cartDomainName?: string;
	comparisonContext: string;
	currencyCode?: string | null;
	currentRoute?: string;
	detailsExpanded: boolean;
	domain?: any;
	domainName?: string;
	domainsWithForwards?: any[];
	gSuiteProductMonthly?: any;
	gSuiteProductYearly?: any;
	hasCartDomain?: boolean;
	intervalLength: IntervalLength;
	isGSuiteSupported?: boolean;
	onExpandedChange?: ( providerKey: string, expand: boolean ) => void;
	productsList?: string[];
	requestingSiteDomains?: boolean;
	selectedDomainName: string;
	selectedSite?: Site | null;
	shoppingCartManager?: any;
	source: string;
	titanMailMonthlyProduct?: any;
	titanMailYearlyProduct?: any;
};
