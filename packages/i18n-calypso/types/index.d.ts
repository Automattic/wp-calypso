// Type definitions for i18n-calypso
// Project: i18n-calypso

declare namespace i18nCalypso {
	export type Substitutions = string | string[] | { [placeholder: string]: string };

	export interface ComponentInterpolations {
		[placeholder: string]: React.ReactElement;
	}

	export interface TranslateOptions {
		args?: Substitutions;
		components?: ComponentInterpolations;
	}

	export function translate( oringinal: string );
	export function translate( oringinal: string, plural: string );
	export function translate( oringinal: string, options: TranslateOptions );
	export function translate( oringinal: string, plural: string, options: TranslateOptions );
}

export = i18nCalypso;
export as namespace i18nCalypso;
