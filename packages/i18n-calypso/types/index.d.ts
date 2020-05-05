// Type definitions for i18n-calypso
// Project: i18n-calypso

/**
 * External dependencies
 */
import * as React from 'react';

declare namespace i18nCalypso {
	type NormalizedTranslateArgs =
		| ( TranslateOptions & { original: string } )
		| ( TranslateOptions & {
				original: string;
				plural: string;
				count: number;
		  } );

	export type Substitution = string | number | React.ReactFragment;

	export type Substitutions =
		| Substitution
		| Substitution[]
		| { [ placeholder: string ]: Substitution };

	export interface ComponentInterpolations {
		[ placeholder: string ]: React.ReactElement;
	}

	export interface TranslateOptions {
		/**
		 * Arguments you would pass into sprintf to be run against the text for string substitution.
		 */
		args?: Substitutions;

		/**
		 * Comment that will be shown to the translator for anything that may need to be explained about the translation.
		 */
		comment?: string;

		/**
		 * Components to be interpolated in the translated string.
		 */
		components?: ComponentInterpolations;

		/**
		 * Provides the ability for the translator to provide a different translation for the same text in two locations (dependent on context). Usually context should only be used after a string has been discovered to require different translations. If you want to provide help on how to translate (which is highly appreciated!), please use a comment.
		 */
		context?: string;
	}

	// This deprecated signature is still supported
	export interface DeprecatedTranslateOptions extends TranslateOptions {
		original: string | { single: string; plural: string; count: number };
	}

	// Translate hooks force us to open up this type.
	export type TranslateResult = string | React.ReactFragment;

	export function translate( options: DeprecatedTranslateOptions ): TranslateResult;
	export function translate( original: string ): TranslateResult;
	export function translate( original: string, options: TranslateOptions ): TranslateResult;
	export function translate(
		original: string,
		plural: string,
		options: TranslateOptions & { count: number }
	): TranslateResult;

	export function hasTranslation( original: string ): boolean;

	export interface NumberFormatOptions {
		decimals?: number;
		decPoint?: string;
		thousandsSep?: string;
	}

	export function numberFormat( number: number, numberOfDecimalPlaces: number ): string;
	export function numberFormat( number: number, options: NumberFormatOptions ): string;

	export interface LocalizeProps {
		locale: string;
		translate: typeof translate;
		numberFormat: typeof numberFormat;
	}

	// Infers prop type from component C
	export type GetProps< C > = C extends React.ComponentType< infer P > ? P : never;

	export type WithoutLocalizedProps< OrigProps > = Pick<
		OrigProps,
		Exclude< keyof OrigProps, keyof LocalizeProps >
	>;

	export type LocalizedComponent< C > = React.ComponentClass<
		WithoutLocalizedProps< GetProps< C > >
	>;

	export function localize< C >( component: C ): LocalizedComponent< C >;

	export function useTranslate(): typeof translate;

	export type TranslateHook = (
		translation: TranslateResult,
		options: NormalizedTranslateArgs
	) => TranslateResult;

	export function registerTranslateHook( hook: TranslateHook ): void;
}

export = i18nCalypso;
export as namespace i18nCalypso;
