import { createContext, useContext } from 'react';
import { Question } from './types';

export type SurveyContextType = {
	currentQuestion?: Question;
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
