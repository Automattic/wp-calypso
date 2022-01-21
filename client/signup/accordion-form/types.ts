import { TranslateResult, useTranslate } from 'i18n-calypso';
import { ChangeEvent, ReactNode } from 'react';

export type ValidationErrors = Record< string, TranslateResult | null >;

export interface ValidationResult {
	result: boolean;
	errors: ValidationErrors;
}

export type ValidatorFunction< T > = ( formValues: T ) => ValidationResult;

export interface AccordionSectionProps< T > {
	title: TranslateResult;
	component: ReactNode;
	showSkip: boolean;
	summary: string | undefined;
	validate?: ValidatorFunction< T >;
}
export interface useSectionReturnType< T > {
	translate: ReturnType< typeof useTranslate >;
	formValues: T;
	formErrors: ValidationErrors;
	onChangeField: ( { target: { name, value } }: ChangeEvent< HTMLInputElement > ) => void;
}
