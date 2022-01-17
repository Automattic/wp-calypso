import { TranslateResult } from 'i18n-calypso';
import { ReactNode } from 'react';
import { SiteInfoCollectionData } from 'calypso/state/signup/steps/site-info-collection/schema';

export type ValidationErrors = Record< string, TranslateResult | null >;

export interface ValidationResult {
	result: boolean;
	errors: ValidationErrors;
}

export type ValidatorFunction = ( formValues: SiteInfoCollectionData ) => ValidationResult;

export interface AccordionSectionProps {
	title: TranslateResult;
	component: ReactNode;
	showSkip: boolean;
	summary: string | undefined;
	validate?: ValidatorFunction;
}
