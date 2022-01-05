import type { TranslateResult } from 'i18n-calypso';
import type { ReactNode } from 'react';

export type ComparisonTableProps = {
	emailProviders: EmailProviderFeatures[];
};

export type EmailProviderFeatures = {
	name: string;
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
	siteName: string;
	source: string;
};
