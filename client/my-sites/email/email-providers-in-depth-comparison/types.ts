import { IntervalLength } from 'calypso/my-sites/email/email-providers-stacked-comparison/provider-cards/utils';
import type { TranslateResult } from 'i18n-calypso';
import type { ReactNode } from 'react';

export type ComparisonTableProps = {
	emailProviders: EmailProviderFeatures[];
	intervalLength: IntervalLength;
	selectedDomainName: string;
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
	selectedIntervalLength: string;
	siteName: string;
	source: string;
};
