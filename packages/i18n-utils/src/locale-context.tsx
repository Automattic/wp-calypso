/**
 * External dependencies
 */
import React, { createContext, useContext } from 'react';
import { createHigherOrderComponent } from '@wordpress/compose';

export const localeContext = createContext< string >( 'en' );

interface Props {
	localeSlug: string;
}

export const LocaleProvider: React.FC< Props > = ( { children, localeSlug } ) => (
	<localeContext.Provider value={ localeSlug }>{ children }</localeContext.Provider>
);

/**
 * React hook providing the current locale slug supplied to `<LocaleProvider>`.
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
	return useContext( localeContext );
}

/**
 * HoC providing the current locale slug supplied to `<LocaleProvider>`.
 *
 * @param InnerComponent Component that will receive `locale` as a prop
 * @returns Component enhanced with locale
 *
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
		return <InnerComponent locale={ locale } { ...props } />;
	};
}, 'withLocale' );
