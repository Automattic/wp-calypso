import { createContext, useContext } from 'react';

export type PaginatedSurveyContextType = {
	currentPage: number;
	previousPage: () => void;
	nextPage: () => void;
};

export const PaginatedSurveyContext = createContext< PaginatedSurveyContextType >( {
	currentPage: 1,
	previousPage: () => {},
	nextPage: () => {},
} );

export const usePaginatedSurveyContext = () => {
	return useContext( PaginatedSurveyContext );
};
