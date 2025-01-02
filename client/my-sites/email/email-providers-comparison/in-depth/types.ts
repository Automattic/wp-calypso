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

const EMAIL_PROVIDER_FEATURES_TYPE = [
	'collaboration',
	'importing',
	'storage',
	'support',
	'tools',
] as const;

type EmailProviderFeature = ( typeof EMAIL_PROVIDER_FEATURES_TYPE )[ number ];

export type EmailProviderFeatures = {
	badge?: ReactNode;
	description: TranslateResult;
	list: Partial< Record< EmailProviderFeature, TranslateResult > >;
	logo: ReactNode;
	name: TranslateResult;
	slug: string;
	supportUrl: string;
	table: Record< EmailProviderFeature, TranslateResult >;
};

export type EmailProvidersInDepthComparisonProps = {
	referrer: string;
	selectedDomainName: string;
	selectedIntervalLength?: IntervalLength;
	source?: string;
	context?: string;
};

export type LearnMoreLinkProps = {
	url: string;
};

export type SelectButtonProps = {
	className: string;
	emailProviderSlug: string;
	intervalLength: IntervalLength;
	onSelectEmailProvider: ( emailProviderSlug: string ) => void;
	selectedDomainName: string;
};
