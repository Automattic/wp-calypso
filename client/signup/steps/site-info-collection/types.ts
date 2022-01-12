import { TranslateResult } from 'i18n-calypso';
import { ReactNode } from 'react';
import { SiteInfoCollectionData } from 'calypso/state/signup/steps/site-info-collection/schema';

export interface ValidationResult {
	result: boolean;
	fields: Record< string, boolean >;
}

export type ValidatorFunction = ( formValues: SiteInfoCollectionData ) => ValidationResult;

export interface SectionProps {
	title: TranslateResult;
	component: ReactNode;
	showSkip: boolean;
	summary: string | undefined;
	validate?: ValidatorFunction;
}
