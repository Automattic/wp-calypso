import { FunctionComponent } from 'react';
import type { TranslateResult } from 'i18n-calypso';
import type { ReactElement } from 'react';

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
