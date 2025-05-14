// Type definitions for i18n-calypso
// Project: i18n-calypso

import * as React from 'react';

type LocaleData = Record< string, unknown >;
type NormalizedTranslateArgs =
	| ( TranslateOptions & { original: string } )
	| ( TranslateOptions & {
			original: string;
			plural: string;
			count: number;
	  } );

// This type represents things that React can render, but which also exist. (E.g.
// not nullable, not undefined, etc.)
type ExistingReactNode = React.ReactElement | string | number;

export type Substitution = ExistingReactNode;

export type Substitutions =
	| Substitution
	| Substitution[]
	| { [ placeholder: string ]: Substitution };

export interface ComponentInterpolations {
	[ placeholder: string ]: React.ReactElement;
}

export interface TranslateOptions {
	/**
	 * Arguments you would pass into `sprintf` to be run against the text for string substitution. Each substitution must exist. If a substitution shouldn't exist in some cases, pass an empty string to make the substitution explicit.
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
export type TranslateResult = ExistingReactNode;

export type TranslateHook = (
	translation: ExistingReactNode,
	options: NormalizedTranslateArgs
) => ExistingReactNode;

export type ComponentUpdateHook = ( ...args: any ) => any;

export type EventListener = ( ...payload: any ) => any;

export interface I18N {
	/**
	 * Translate a string.
	 * @example translate( "Hello, %(name)s", { args: { name: "World" } } );
	 * @param original The original string to translate.
	 * @param options Options for the translation. Note that substutions must exist.
	 * If a substitution really should result in a blank string, pass an empty
	 * string to make that explicit.
	 */
	translate( options: DeprecatedTranslateOptions ): ExistingReactNode;
	translate( original: string ): string;
	translate( original: string ): ExistingReactNode;
	translate( original: string, options: TranslateOptions ): ExistingReactNode;
	translate( original: string, options: TranslateOptionsText ): string;
	translate( original: string, plural: string, options: TranslateOptionsPlural ): ExistingReactNode;
	translate( original: string, plural: string, options: TranslateOptionsPluralText ): string;

	setLocale( localeData: LocaleData ): void;
	addTranslations( localeData: LocaleData ): void;
	hasTranslation( original: string ): boolean;

	configure( options: Record< string, any > ): void;

	/**
	 * Fetches geolocation data from the specified endpoint URL.
	 * If the fetch operation fails, it logs a warning message to the console.
	 * Used for currencies: when the user is inside the US using USD,
	 * they should only see `$` and not `US$`.
	 *
	 * This will attempt to make an unauthenticated network request to `https://public-api.wordpress.com/geo/`.
	 * This is to determine the country code to provide better USD formatting.
	 * By default, the currency symbol for USD will be based on the locale (unlike other currency codes which
	 * use a hard-coded list of overrides); for `en-US`/`en` it will be `$` and for all other locales it will be `US$`.
	 * However, if the geolocation determines that the country is not inside the US, the USD symbol will be `US$`
	 * regardless of locale. This is to prevent confusion for users in non-US countries using an English locale.
	 *
	 * In the US, users will expect to see USD prices rendered with the currency symbol `$`.
	 * However, there are many other currencies which use `$` as their currency symbol (eg: `CAD`).
	 * This package tries to prevent confusion between these symbols by using an international version of the symbol
	 * when the locale does not match the currency. So if your locale is `en-CA`, USD prices will be rendered with the symbol `US$`.
	 *
	 * However, this relies on the user having set their interface language to something other than `en-US`/`en`,
	 * and many English-speaking non-US users still have that interface language (eg: there's no English locale available
	 * in our settings for Argentinian English so such users would probably still have `en`).
	 * As a result, those users will see a price with `$` and could be misled about what currency is being displayed.
	 * `geolocateCurrencySymbol()` helps prevent that from happening by showing `US$` for those users.
	 */
	geolocateCurrencySymbol( callback?: ( geoLocation: string ) => void ): Promise< void >;

	getLocale(): LocaleData;
	getLocaleSlug(): string | null; // TODO clk i18ncalypso this should be string. Default is 'en'
	getLocaleVariant(): string | undefined;
	getBrowserSafeLocale(): string;
	isRtl(): boolean;
	defaultLocaleSlug: string;

	reRenderTranslations(): void;

	registerTranslateHook( hook: TranslateHook ): void;
	registerComponentUpdateHook( hook: ComponentUpdateHook ): void;

	on( eventName: string, listener: EventListener ): void;
	off( eventName: string, listener: EventListener ): void;
	emit( eventName: string, ...payload: any ): void;

	/**
	 * Returns `newCopy` if given `text` is translated or locale is English, otherwise returns the `oldCopy`.
	 *
	 * `newCopy` prop should be an actual `i18n.translate()` call from the consuming end.
	 * This is the only way currently to ensure that it is picked up by our string extraction mechanism
	 * and propagate into GlotPress for translation.
	 * @param options
	 * @param options.text - The text to check for translation.
	 * @param options.newCopy - The translation to return if the text is translated.
	 * @param options.oldCopy - The fallback to return if the text is not translated.
	 * @param options.translationOptions - Optional. The options to pass to the translation.
	 * @example
	 * i18n.fixMe( {
	 * 	text: 'new copy',
	 * 	newCopy: i18n.translate( 'new copy' ),
	 * 	oldCopy: i18n.translate( 'old copy' ),
	 * 	translationOptions: {
	 * 		context: 'Some disambiguating context if needed for the translation',
	 * 	}
	 * } );
	 */
	fixMe( options: {
		text: string;
		newCopy: ExistingReactNode;
		oldCopy?: ExistingReactNode;
		translationOptions?: TranslateOptions;
	} ): ExistingReactNode | null;
}

declare const i18n: I18N;
export default i18n;
export declare const translate: typeof i18n.translate;
export declare const geolocateCurrencySymbol: typeof i18n.geolocateCurrencySymbol;
export declare const setLocale: typeof i18n.setLocale;
export declare const addTranslations: typeof i18n.addTranslations;
export declare const configure: typeof i18n.configure;
export declare const getLocale: typeof i18n.getLocale;
export declare const getLocaleSlug: typeof i18n.getLocaleSlug;
export declare const getLocaleVariant: typeof i18n.getLocaleVariant;
export declare const getBrowserSafeLocale: typeof i18n.getBrowserSafeLocale;
export declare const isRtl: typeof i18n.isRtl;
export declare const defaultLocaleSlug: typeof i18n.defaultLocaleSlug;
export declare const registerTranslateHook: typeof i18n.registerTranslateHook;
export declare const registerComponentUpdateHook: typeof i18n.registerComponentUpdateHook;
export declare const on: typeof i18n.on;
export declare const off: typeof i18n.off;
export declare const emit: typeof i18n.emit;
export declare const fixMe: typeof i18n.fixMe;

export interface LocalizeProps {
	locale: string;
	translate: typeof translate;
}

export type WithoutLocalizedProps< OrigProps > = Pick<
	OrigProps,
	Exclude< keyof OrigProps, keyof LocalizeProps >
>;

export type LocalizedComponent< C extends React.JSXElementConstructor< any > > =
	React.ComponentClass< WithoutLocalizedProps< React.ComponentPropsWithRef< C > > >;

export function localize< C extends React.JSXElementConstructor< any > >(
	component: C
): LocalizedComponent< C >;
export function useTranslate(): typeof translate & { localeSlug: string | undefined };
export function useRtl(): boolean;

export declare const I18NContext: React.Context< I18N >;
