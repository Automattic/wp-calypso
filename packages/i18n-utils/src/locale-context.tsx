import { createHigherOrderComponent } from '@wordpress/compose';
import * as i18n from '@wordpress/i18n';
import { createContext, useContext, useEffect, useState } from 'react';
import * as React from 'react';
import type { Locale } from './locales';

export const localeContext = createContext< string | null >( null );

interface Props {
	localeSlug: string;
}

export const LocaleProvider: React.FC< Props > = ( { children, localeSlug } ) => (
	<localeContext.Provider value={ localeSlug }>{ children }</localeContext.Provider>
);

/**
 * Returns locale slug
 *
 * @param {string} locale locale to be converted e.g. "en_US".
 * @returns locale string e.g. "en"
 */
function mapWpI18nLangToLocaleSlug( locale: Locale = '' ): Locale {
	if ( ! locale ) {
		return '';
	}

	const TARGET_LOCALES = [ 'pt_br', 'pt-br', 'zh_tw', 'zh-tw', 'zh_cn', 'zh-cn', 'zh_sg', 'zh-sg' ];
	const lowerCaseLocale = locale.toLowerCase();
	const formattedLocale = TARGET_LOCALES.includes( lowerCaseLocale )
		? lowerCaseLocale.replace( '_', '-' )
		: lowerCaseLocale.replace( /([-_].*)$/i, '' );

	return formattedLocale || 'en';
}

/**
 * Get the current locale slug from the @wordpress/i18n locale data
 */
function getWpI18nLocaleSlug(): string | undefined {
	const language = i18n.getLocaleData ? i18n.getLocaleData()?.[ '' ]?.language : '';

	return mapWpI18nLangToLocaleSlug( language );
}

/**
 * React hook providing the current locale slug. If `<LocaleProvider>` hasn't
 * been defined in the component tree then it will fall back to using the
 * data from `@wordpress/i18n` to determine the current locale slug.
 *
 * @example
 *
 * import { useLocale } from '@automattic/i18n-utils';
 * function MyComponent() {
 *   const locale = useLocale();
 *   return <div>The current locale is: { locale }</div>;
 * }
 */
export function useLocale(): string {
	const fromProvider = useContext( localeContext );
	const providerHasLocale = !! fromProvider;

	const [ fromWpI18n, setWpLocale ] = useState( getWpI18nLocaleSlug() );

	useEffect( () => {
		// If the <LocaleProvider> has been used further up the component tree
		// then we don't want to subscribe to any defaultI18n changes.
		if ( providerHasLocale ) {
			return;
		}

		setWpLocale( getWpI18nLocaleSlug() );

		return i18n.subscribe( () => {
			setWpLocale( getWpI18nLocaleSlug() );
		} );
	}, [ providerHasLocale ] );

	return fromProvider || fromWpI18n || 'en';
}

/**
 * HoC providing the current locale slug supplied to `<LocaleProvider>`.
 *
 * @param InnerComponent Component that will receive `locale` as a prop
 * @returns Component enhanced with locale
 * @example
 *
 * import { withLocale } from '@automattic/i18n-utils';
 * function MyComponent( { locale } ) {
 *   return <div>The current locale is: { locale }</div>;
 * }
 * export default withLocale( MyComponent );
 */
export const withLocale = createHigherOrderComponent< { locale: string } >( ( InnerComponent ) => {
	return ( props ) => {
		const locale = useLocale();
		// There is an issue with a type rework in the upstream package which causes
		// this correct use to fail without an ignore. See https://github.com/WordPress/gutenberg/pull/37795
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore-next-line
		return <InnerComponent locale={ locale } { ...props } />;
	};
}, 'withLocale' );
