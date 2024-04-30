import React, { createContext, ReactNode, useState } from 'react';
import type { SiteDetails } from '@automattic/data-stores';
import type { SiteSlug } from 'calypso/types';
import type { Dispatch, SetStateAction } from 'react';

export type MultisitePluginUpdateManagerErrors = {
	siteSlug: SiteSlug;
	error: string;
	site?: SiteDetails | null;
}[];

interface MultisitePluginUpdateManagerContextProps {
	errors: MultisitePluginUpdateManagerErrors;
	setErrors: Dispatch< SetStateAction< MultisitePluginUpdateManagerErrors > >;
}

const MultisitePluginUpdateManagerContext =
	createContext< MultisitePluginUpdateManagerContextProps >( {
		errors: [],
		setErrors: () => {},
	} );

const MultisitePluginUpdateManagerContextProvider = ( { children }: { children: ReactNode } ) => {
	const [ errors, setErrors ] = useState< MultisitePluginUpdateManagerErrors >( [] );

	return (
		<MultisitePluginUpdateManagerContext.Provider value={ { errors, setErrors } }>
			{ children }
		</MultisitePluginUpdateManagerContext.Provider>
	);
};

export { MultisitePluginUpdateManagerContext, MultisitePluginUpdateManagerContextProvider };
