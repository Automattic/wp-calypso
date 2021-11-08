import 'calypso/state/imports/init';
import wpcom from 'calypso/lib/wp';
import {
	URL_ANALYZER_ANALYZE_DONE,
	URL_ANALYZER_ANALYZE,
	URL_ANALYZER_ANALYZE_SUCCESS,
	URL_ANALYZER_ANALYZE_ERROR,
	URL_ANALYZER_RESET_ERROR,
	URL_ANALYZER_URL_DATA_UPDATE,
} from '../../action-types';
import type { UrlData } from 'calypso/signup/steps/import/types';
import type { AnyAction, Dispatch } from 'redux';

export const analyzeUrl = ( url: string ) => (
	dispatch: Dispatch< AnyAction >
): Promise< UrlData > => {
	dispatch( {
		type: URL_ANALYZER_ANALYZE,
	} );

	return wpcom
		.undocumented()
		.ImportsAnalyzeUrl( url )
		.then( ( response: UrlData ) => {
			// Update the state
			dispatch( {
				type: URL_ANALYZER_ANALYZE_SUCCESS,
				payload: response,
			} );

			return response;
		} )
		.catch( ( error: Error ) => {
			dispatch( {
				type: URL_ANALYZER_ANALYZE_ERROR,
				payload: error,
			} );

			throw error;
		} )
		.finally( () => {
			dispatch( {
				type: URL_ANALYZER_ANALYZE_DONE,
			} );
		} );
};

export const resetError = () => ( dispatch: Dispatch< AnyAction > ): void => {
	dispatch( {
		type: URL_ANALYZER_RESET_ERROR,
	} );
};

export const urlDataUpdate = ( urlData: UrlData ) => ( dispatch: Dispatch< AnyAction > ): void => {
	dispatch( {
		type: URL_ANALYZER_URL_DATA_UPDATE,
		payload: urlData,
	} );
};
