import { createContext, useContext } from 'react';

type PatternsContextProps = {
	searchTerm: string;
};

export const PatternsContext = createContext< PatternsContextProps >( {
	searchTerm: '',
} );

export const usePatternsContext = () => useContext( PatternsContext );
