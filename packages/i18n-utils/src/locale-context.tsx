/**
 * External dependencies
 */
import React, { createContext, useContext } from 'react';

export const localeContext = createContext< string >( 'en' );

interface Props {
	localeSlug: string;
}

export const LocaleProvider: React.FC< Props > = ( { children, localeSlug } ) => (
	<localeContext.Provider value={ localeSlug }>{ children }</localeContext.Provider>
);

export function useLocale(): string {
	return useContext( localeContext );
}
