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
	disabled?: boolean;
	disabledReason?: TranslateResult;
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
	disabled?: boolean;
	disabledReason?: TranslateResult;
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
	intervalLength: IntervalLength;
	titanMailMonthlyProduct?: any;
	titanMailYearlyProduct?: any;
	onExpandedChange?: ( providerKey: string, expand: boolean ) => void;
};

type ValueError = {
	value: string;
	error: string;
};

export type Mailbox = {
	uuid: string;
	domain: ValueError;
	mailbox: ValueError;
	password: ValueError;
};
