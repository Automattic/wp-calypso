import { urlData } from 'calypso/signup/steps/import/types';
import 'calypso/state/imports/init';
import type { State } from './reducer';

export const isAnalyzing = ( state: State ): boolean => {
	return state.imports.urlAnalyzer.isAnalyzing;
};

export const getUrlData = ( state: State ): urlData => {
	return state.imports.urlAnalyzer.urlData;
};

export const getAnalyzerError = ( state: State ): Error => {
	return state.imports.urlAnalyzer.analyzerError;
};
