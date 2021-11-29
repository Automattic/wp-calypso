import { Domain } from '@automattic/data-stores/dist/types/site';
import { TranslateResult } from 'i18n-calypso';
import { ReactElement } from 'react';

export type Site = {
	ID: number;
	slug: string;
};

export interface ProviderCard {
	additionalPriceInformation?: TranslateResult;
	badge?: ReactElement;
	buttonLabel?: TranslateResult;
	children?: ReactElement;
	description: TranslateResult;
	detailsExpanded: boolean;
	discount?: ReactElement;
	expandButtonLabel: TranslateResult;
	features: TranslateResult[];
	footerBadge?: ReactElement;
	formattedPrice?: TranslateResult;
	logo: ReactElement;
	onExpandedChange: ( providerKey: string, expanded: boolean ) => void;
	onButtonClick?: ( event: React.MouseEvent ) => void;
	productName: TranslateResult;
	providerKey: string;
	showExpandButton: boolean;
}

export type EmailProvidersStackedCardProps = {
	comparisonContext: string;
	cart?: any;
	cartDomainName?: string;
	selectedSite?: Site;
	currencyCode?: string;
	currentRoute?: string;
	domain?: any;
	domainName?: string;
	domainsWithForwards?: Domain[];
	gSuiteProduct?: string;
	hasCartDomain?: boolean;
	isGSuiteSupported?: boolean;
	productsList?: string[];
	requestingSiteDomains?: boolean;
	selectedDomainName: string;
	shoppingCartManager?: any;
	source: string;
	titanMailProduct?: any;
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
