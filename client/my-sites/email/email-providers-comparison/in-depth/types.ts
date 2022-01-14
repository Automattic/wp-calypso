import { IntervalLength } from 'calypso/my-sites/email/email-providers-comparison/interval-length';
import type { SiteDomain } from 'calypso/state/sites/domains/types';
import type { TranslateResult } from 'i18n-calypso';
import type { ReactNode } from 'react';

export type ComparisonTableProps = {
	emailProviders: EmailProviderFeatures[];
	intervalLength: IntervalLength;
	selectedDomainName: string;
};

export type ComparisonTablePriceProps = {
	domain: SiteDomain | undefined;
	emailProviderSlug: string;
	intervalLength: IntervalLength;
};

export type EmailProviderFeatures = {
	slug: string;
	name: TranslateResult;
	logo: ReactNode;
	tools: TranslateResult;
	storage: TranslateResult;
	importing: TranslateResult;
	support: TranslateResult;
	selectCallback: () => void;
};

export type EmailProvidersInDepthComparisonProps = {
	comparisonContext: string;
	selectedDomainName: string;
	selectedIntervalLength: IntervalLength | undefined;
	siteName: string;
	source: string;
};
