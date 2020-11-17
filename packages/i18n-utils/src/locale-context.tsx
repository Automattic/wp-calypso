/**
 * External dependencies
 */
import React, { createContext, useContext } from 'react';

export const LocaleContext = createContext< string >( 'en' );

interface Props {
	localeSlug: string;
}

export const LocaleProvider: React.FC< Props > = ( { children, localeSlug } ) => (
	<LocaleContext.Provider value={ localeSlug }>{ children }</LocaleContext.Provider>
);

export function useLocale(): string {
	return useContext( LocaleContext );
}
