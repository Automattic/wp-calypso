import { ReactElement } from 'react';
import type { Site } from 'calypso/my-sites/scan/types';
import type { TranslateResult } from 'i18n-calypso';

export interface ProviderCard {
	additionalPriceInformation?: TranslateResult;
	badge?: ReactElement;
	buttonLabel?: TranslateResult;
	children?: ReactElement;
	description: TranslateResult;
	detailsExpanded: boolean;
	discount?: ReactElement | null;
	expandButtonLabel: TranslateResult;
	features: TranslateResult[];
	footerBadge?: ReactElement;
	formattedPrice?: TranslateResult;
	formFields?: ReactElement;
	isDomainEligibleForTitanFreeTrial?: boolean;
	logo: ReactElement | { path: string };
	onExpandedChange: ( providerKey: string, expanded: boolean ) => void;
	onButtonClick?: ( event: React.MouseEvent ) => void;
	priceBadge?: ReactElement;
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
	domainsWithForwards?: any[];
	gSuiteProduct?: any;
	hasCartDomain?: boolean;
	isGSuiteSupported?: boolean;
	productsList?: string[];
	requestingSiteDomains?: boolean;
	selectedDomainName: string;
	shoppingCartManager?: any;
	source: string;
	titanMailProduct?: any;
	recordTracksEventAddToCartClick?: (
		comparisonContext: string,
		validatedMailboxUuids: string[],
		mailboxesAreValid: boolean,
		provider: string,
		source: string,
		userCanAddEmail: boolean,
		userCannotAddEmailReason: any
	) => void;
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
