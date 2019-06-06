// Type definitions for i18n-calypso
// Project: i18n-calypso

/**
 * External dependencies
 */
import { ComponentClass, ComponentType, ReactElement } from 'react';
import moment from 'moment';

declare namespace i18nCalypso {
	export type Substitution = string | number;

	export type Substitutions =
		| Substitution
		| Substitution[]
		| { [placeholder: string]: Substitution };

	export interface ComponentInterpolations {
		[placeholder: string]: ReactElement;
	}

	export interface TranslateOptions {
		/**
		 * Arguments you would pass into sprintf to be run against the text for string substitution.
		 */
		args?: Substitutions;

		/**
		 * Components for interpolation in the provided string.
		 */
		components?: ComponentInterpolations;

		/**
		 * Comment that will be shown to the translator for anything that may need to be explained about the translation.
		 */
		comment?: string;

		/**
		 * Provides the ability for the translator to provide a different translation for the same text in two locations (dependent on context). Usually context should only be used after a string has been discovered to require different translations. If you want to provide help on how to translate (which is highly appreciated!), please use a comment.
		 */
		context?: string;
	}

	export type TranslatedString = string;

	export function translate( original: string ): TranslatedString;
	export function translate(
		original: string,
		plural: string,
		options: TranslateOptions & { count: number }
	): TranslatedString;
	export function translate( original: string, options: TranslateOptions ): TranslatedString;
	export function translate(
		original: string,
		plural: string,
		options: TranslateOptions
	): TranslatedString;

	export function hasTranslation( original: string ): boolean;

	export interface NumberFormatOptions {
		decimals?: number;
		decPoint?: string;
		thousandsSep?: string;
	}

	export function numberFormat( number: number, numberOfDecimalPlaces: number );
	export function numberFormat( number: number, options: NumberFormatOptions );

	export interface LocalizeProps {
		translate: typeof translate;
		numberFormat: typeof numberFormat;
		moment: typeof moment;
	}

	// Infers prop type from component C
	export type GetProps< C > = C extends ComponentType< infer P > ? P : never;

	export type WithoutLocalizedProps< OrigProps > = Pick<
		OrigProps,
		Exclude< keyof OrigProps, keyof LocalizeProps >
	>;

	export type LocalizedComponent< C > = ComponentClass< WithoutLocalizedProps< GetProps< C > > >;

	export function localize< C >( component: C ): LocalizedComponent< C >;

	export function useTranslate(): typeof translate;
}

export = i18nCalypso;
export as namespace i18nCalypso;
