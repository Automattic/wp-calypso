import { ReactElement } from 'react';
import { IntervalLength } from 'calypso/my-sites/email/email-providers-comparison/interval-length';
import type { AppLogo } from 'calypso/my-sites/email/email-providers-stacked-comparison/email-provider-stacked-card/email-provider-stacked-features';
import type { TranslateResult } from 'i18n-calypso';

export interface ProviderCardProps {
	appLogos?: AppLogo[];
	className?: string;
	description: TranslateResult;
	detailsExpanded?: boolean;
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
	isDomainInCart?: boolean;
	comparisonContext: string;
	detailsExpanded: boolean;
	intervalLength: IntervalLength;
	onExpandedChange: ( providerKey: string, expand: boolean ) => void;
	selectedDomainName: string;
	source: string;
};
