import { TranslateResult, useTranslate } from 'i18n-calypso';
import { ChangeEvent, ReactNode } from 'react';
import { BBETranslationContext } from '../difm/translation-hooks';

export type ValidationErrors = Record< string, TranslateResult | null >;

export interface ValidationResult {
	result: boolean;
	errors: ValidationErrors;
}

export type ValidatorFunction< T > = ( formValues: T ) => ValidationResult;

export interface AccordionSectionProps< T > {
	title: TranslateResult;
	component?: ReactNode;
	children?: ReactNode;
	showSkip: boolean;
	summary?: string;
	validate?: ValidatorFunction< T >;
}
export interface SectionGeneratorReturnType< T > {
	translate: ReturnType< typeof useTranslate >;
	formValues: T;
	formErrors: ValidationErrors;
	context: BBETranslationContext;
	onChangeField: ( { target: { name, value } }: ChangeEvent< HTMLInputElement > ) => void;
}
