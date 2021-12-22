import { FunctionComponent, ReactElement } from 'react';
import type { TranslateResult } from 'i18n-calypso';

export type ProviderComparison = {
	header: ReactElement;
	tools: TranslateResult;
	storage: TranslateResult;
	importing: TranslateResult;
	support: TranslateResult;
	footerBadge?: ReactElement;
	selectCallback: () => void;
};

type InDepthComparisonProps = {
	comparisonObjects: ProviderComparison[];
};

export const InDepthComparison: FunctionComponent< InDepthComparisonProps > = () => {
	return <p> New component </p>;
};
