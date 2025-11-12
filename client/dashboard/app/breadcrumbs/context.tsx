import { useLocation } from '@tanstack/react-router';
import { createContext, useContext, useState, useEffect } from 'react';
import type { ParsedLocation } from '@tanstack/react-router';
import type { ReactNode } from 'react';

interface BreadcrumbsContextType {
	previousLocation?: ParsedLocation;
}

const BreadcrumbsContext = createContext< BreadcrumbsContextType | undefined >( undefined );

export function BreadcrumbsProvider( { children }: { children: ReactNode } ) {
	const location = useLocation();
	const [ previousLocation, setPreviousLocation ] = useState< ParsedLocation | undefined >(
		undefined
	);

	useEffect( () => {
		return () => {
			setPreviousLocation( location );
		};
	}, [ location ] );

	return (
		<BreadcrumbsContext.Provider value={ { previousLocation } }>
			{ children }
		</BreadcrumbsContext.Provider>
	);
}

export function usePreviousLocation() {
	const context = useContext( BreadcrumbsContext );
	return context?.previousLocation;
}
