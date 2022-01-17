import { IntervalLength } from 'calypso/my-sites/email/email-providers-comparison/interval-length';
import type { TranslateResult } from 'i18n-calypso';
import type { ReactNode } from 'react';

export type ComparisonListOrTableProps = {
	emailProviders: EmailProviderFeatures[];
	intervalLength: IntervalLength;
	onSelectEmailProvider: ( emailProviderSlug: string ) => void;
	selectedDomainName: string;
};

export type EmailProviderPriceProps = {
	emailProviderSlug: string;
	intervalLength: IntervalLength;
	selectedDomainName: string;
};

const EMAIL_PROVIDER_FEATURES_TYPE = [ 'importing', 'storage', 'support', 'tools' ] as const;

type EmailProviderFeature = typeof EMAIL_PROVIDER_FEATURES_TYPE[ number ];

export type EmailProviderFeatures = {
	description: TranslateResult;
	list: Record< EmailProviderFeature, TranslateResult >;
	logo: ReactNode;
	name: TranslateResult;
	slug: string;
	supportUrl: string;
};

export type EmailProvidersInDepthComparisonProps = {
	comparisonContext: string;
	selectedDomainName: string;
	selectedIntervalLength: IntervalLength | undefined;
	siteName: string;
	source: string;
};

export type LearnMoreLinkProps = {
	url: string;
};
