// Type definitions for i18n-calypso
// Project: i18n-calypso

/**
 * External dependencies
 */
import * as React from 'react';
import moment from 'moment';

interface InterpolateComponentsOptions {
	mixedString: string;
	components: i18nCalypso.ComponentInterpolations;
	throwErrors?: boolean;
}

declare function interpolateComponents(
	options: InterpolateComponentsOptions
): string | React.ReactFragment;

declare namespace i18nCalypso {
	export interface NormalizedTranslateArgs extends TranslateOptions {
		original: string;
		components?: ComponentInterpolations;
	}

	export type TranslateHook = (
		translation: string | React.ReactFragment,
		options:
			| NormalizedTranslateArgs
			| ( NormalizedTranslateArgs & { plural: Substitution; count: number } )
	) => ReturnType< typeof translate >;

	export type Substitution = string | number;

	export type Substitutions =
		| Substitution
		| Substitution[]
		| { [placeholder: string]: Substitution };

	export interface ComponentInterpolations {
		[placeholder: string]: React.ReactElement;
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
		 * Provides the ability for the translator to provide a different translation for the same text in two locations (dependent on context). Usually context should only be used after a string has been discovered to require different translations. If you want to provide help on how to translate (which is highly appreciated!), please use a comment.
		 */
		context?: string;
	}

	export type TranslationWithComponents = ReturnType< typeof interpolateComponents >;

	export function translate( original: string ): string;

	export function translate(
		options: TranslateOptions & { original: string } & { components: ComponentInterpolations }
	): TranslationWithComponents;
	export function translate( options: TranslateOptions & { original: string } ): string;

	export function translate(
		original: string,
		options: TranslateOptions & { components: ComponentInterpolations }
	): TranslationWithComponents;
	export function translate( original: string, options: TranslateOptions ): string;

	export function translate(
		original: string,
		plural: string,
		options: TranslateOptions & { count: number } & { components: ComponentInterpolations }
	): TranslationWithComponents;
	export function translate(
		original: string,
		plural: string,
		options: TranslateOptions & { count: number }
	): string;

	export function hasTranslation( original: string ): boolean;

	export interface NumberFormatOptions {
		decimals?: number;
		decPoint?: string;
		thousandsSep?: string;
	}

	export function numberFormat( number: number, numberOfDecimalPlaces: number );
	export function numberFormat( number: number, options: NumberFormatOptions );

	export interface LocalizeProps {
		locale: string;
		translate: typeof translate;
		numberFormat: typeof numberFormat;
		moment: typeof moment;
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

	export function registerTranslateHook( hook: TranslateHook ): void;
}

export = i18nCalypso;
export as namespace i18nCalypso;
