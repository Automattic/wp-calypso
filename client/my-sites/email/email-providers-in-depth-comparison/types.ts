import type { TranslateResult } from 'i18n-calypso';

export type ComparisonTableProps = {
	emailProviders: EmailProviderFeatures[];
};

export type EmailProviderFeatures = {
	header: string;
	tools: TranslateResult;
	storage: TranslateResult;
	importing: TranslateResult;
	support: TranslateResult;
	selectCallback: () => void;
};

export type EmailProvidersInDepthComparisonProps = {
	comparisonContext: string;
	selectedDomainName: string;
	siteName: string;
	source: string;
};
