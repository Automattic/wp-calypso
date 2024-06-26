import React, { createContext, ReactNode, useState } from 'react';
import type { SiteDetails } from '@automattic/data-stores';
import type { SiteSlug } from 'calypso/types';
import type { Dispatch, SetStateAction } from 'react';

export type MultisitePluginUpdateManagerErrors = {
	siteSlug: SiteSlug;
	error: string;
	operation: 'create' | 'update' | 'delete';
	site?: SiteDetails | null;
}[];

interface MultisitePluginUpdateManagerContextProps {
	errors: MultisitePluginUpdateManagerErrors;
	setErrors: Dispatch< SetStateAction< MultisitePluginUpdateManagerErrors > >;
	searchTerm: string;
	handleSearch: Dispatch< SetStateAction< string > >;
}

const MultisitePluginUpdateManagerContext =
	createContext< MultisitePluginUpdateManagerContextProps >( {
		errors: [],
		setErrors: () => {},
		searchTerm: '',
		handleSearch: () => {},
	} );

const MultisitePluginUpdateManagerContextProvider = ( { children }: { children: ReactNode } ) => {
	const [ errors, setErrors ] = useState< MultisitePluginUpdateManagerErrors >( [] );
	const [ searchTerm, handleSearch ] = useState< string >( '' );

	return (
		<MultisitePluginUpdateManagerContext.Provider
			value={ { errors, setErrors, searchTerm, handleSearch } }
		>
			{ children }
		</MultisitePluginUpdateManagerContext.Provider>
	);
};

export { MultisitePluginUpdateManagerContext, MultisitePluginUpdateManagerContextProvider };
