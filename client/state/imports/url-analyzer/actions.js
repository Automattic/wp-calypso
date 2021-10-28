import 'calypso/state/imports/init';
import wpcom from 'calypso/lib/wp';
import {
	URL_ANALYZER_ANALYZE_DONE,
	URL_ANALYZER_ANALYZE,
	URL_ANALYZER_ANALYZE_SUCCESS,
} from '../../action-types';

export const analyzeUrl = ( url ) => ( dispatch ) => {
	dispatch( {
		type: URL_ANALYZER_ANALYZE,
	} );

	return wpcom
		.undocumented()
		.analyzeUrl( url )
		.then( ( response ) => {
			// Update the state
			dispatch( {
				type: URL_ANALYZER_ANALYZE_SUCCESS,
				data: response,
			} );
		} )
		.finally( () => {
			dispatch( {
				type: URL_ANALYZER_ANALYZE_DONE,
			} );
		} );
};
