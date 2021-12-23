import { FunctionComponent } from 'react';
import type { TranslateResult } from 'i18n-calypso';

export type EmailProviderFeatures = {
	header: string;
	tools: TranslateResult;
	storage: TranslateResult;
	importing: TranslateResult;
	support: TranslateResult;
	selectCallback: () => void;
};

type ComparisonTableProps = {
	emailProviders: EmailProviderFeatures[];
};

const ComparisonTable: FunctionComponent< ComparisonTableProps > = () => {
	return <p> New component </p>;
};

export default ComparisonTable;
