import { FunctionComponent } from 'react';
import type { TranslateResult } from 'i18n-calypso';

export type ProviderComparison = {
	header: string;
	tools: TranslateResult;
	storage: TranslateResult;
	importing: TranslateResult;
	support: TranslateResult;
	selectCallback: () => void;
};

type InDepthComparisonProps = {
	comparisonObjects: ProviderComparison[];
};

const ComparisonTable: FunctionComponent< InDepthComparisonProps > = () => {
	return <p> New component </p>;
};

export default ComparisonTable;
