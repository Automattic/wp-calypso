import 'calypso/state/imports/init';

export const isAnalyzing = ( state ) => {
	return state.imports.urlAnalyzer.isAnalyzing;
};

export const getUrlData = ( state ) => {
	return state.imports.urlAnalyzer.urlData;
};
