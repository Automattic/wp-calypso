import { createContext, useContext } from 'react';

export type SurveyContextType = {
	currentPage: number;
	previousPage: () => void;
	nextPage: () => void;
	skip: () => void;
};

export const SurveyContext = createContext< SurveyContextType >( {
	currentPage: 1,
	previousPage: () => {},
	nextPage: () => {},
	skip: () => {},
} );

export const useSurveyContext = () => {
	return useContext( SurveyContext );
};
