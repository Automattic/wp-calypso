// Type definitions for i18n-calypso
// Project: i18n-calypso

import * as React from 'react';

type LocaleData = Record< string, any >;
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

export type TranslateOptionsText = TranslateOptions & { textOnly: true };
export type TranslateOptionsPlural = TranslateOptions & { count: number };
export type TranslateOptionsPluralText = TranslateOptionsPlural & { textOnly: true };

// Translate hooks, like component interpolation or highlighting untranslated strings,
// force us to declare the return type as a generic React node, not as just string.
export type TranslateResult = React.ReactChild;

export interface NumberFormatOptions {
	decimals?: number;
	decPoint?: string;
	thousandsSep?: string;
}

export type TranslateHook = (
	translation: React.ReactChild,
	options: NormalizedTranslateArgs
) => React.ReactChild;

export type ComponentUpdateHook = ( ...args: any ) => any;

export type EventListener = ( ...payload: any ) => any;

export interface I18N {
	translate( options: DeprecatedTranslateOptions ): React.ReactChild;
	translate( original: string ): React.ReactChild;
	translate( original: string, options: TranslateOptions ): React.ReactChild;
	translate( original: string, options: TranslateOptionsText ): string;
	translate( original: string, plural: string, options: TranslateOptionsPlural ): React.ReactChild;
	translate( original: string, plural: string, options: TranslateOptionsPluralText ): string;

	numberFormat( number: number, numberOfDecimalPlaces: number ): string;
	numberFormat( number: number, options: NumberFormatOptions ): string;

	setLocale( localeData: LocaleData ): void;
	addTranslations( localeData: LocaleData ): void;
	hasTranslation( original: string ): boolean;

	configure( options: Record< string, any > ): void;

	getLocale(): LocaleData;
	getLocaleSlug(): string | null;
	getLocaleVariant(): string | undefined;
	isRtl(): boolean;
	defaultLocaleSlug: string;

	reRenderTranslations(): void;

	registerTranslateHook( hook: TranslateHook ): void;
	registerComponentUpdateHook( hook: ComponentUpdateHook ): void;

	on( eventName: string, listener: EventListener ): void;
	off( eventName: string, listener: EventListener ): void;
	emit( eventName: string, ...payload: any ): void;
}

declare const i18n: I18N;
export default i18n;
export declare const translate: typeof i18n.translate;
export declare const numberFormat: typeof i18n.numberFormat;
export declare const setLocale: typeof i18n.setLocale;
export declare const addTranslations: typeof i18n.addTranslations;
export declare const configure: typeof i18n.configure;
export declare const getLocale: typeof i18n.getLocale;
export declare const getLocaleSlug: typeof i18n.getLocaleSlug;
export declare const getLocaleVariant: typeof i18n.getLocaleVariant;
export declare const isRtl: typeof i18n.isRtl;
export declare const defaultLocaleSlug: typeof i18n.defaultLocaleSlug;
export declare const registerTranslateHook: typeof i18n.registerTranslateHook;
export declare const registerComponentUpdateHook: typeof i18n.registerComponentUpdateHook;
export declare const on: typeof i18n.on;
export declare const off: typeof i18n.off;
export declare const emit: typeof i18n.emit;

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
export function useTranslate(): typeof translate & { localeSlug: string | undefined };
export function useRtl(): boolean;
