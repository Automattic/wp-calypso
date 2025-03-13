import { wpcomRequest } from '../wpcom-request-controls';
import { AnalyzeColorsResponse } from './types';

export function createActions() {
	const colorsAnalyzeStart = ( url: string ) => ( {
		type: 'COLORS_ANALYZE_START' as const,
		url,
	} );

	const colorsAnalyzeSuccess = ( url: string, data: AnalyzeColorsResponse ) => ( {
		type: 'COLORS_ANALYZE_SUCCESS' as const,
		data: { url, colors: data.colors },
	} );

	const colorsAnalyzeFailed = ( url: string ) => ( {
		type: 'COLORS_ANALYZE_FAILED' as const,
		url,
	} );

	function* analyzeColors( url: string ) {
		yield colorsAnalyzeStart( url );

		try {
			const data: AnalyzeColorsResponse = yield wpcomRequest( {
				path: '/imports/url-analyzer/colors/?url=' + encodeURIComponent( url ),
				apiNamespace: 'wpcom/v2',
			} );

			yield colorsAnalyzeSuccess( url, data );
		} catch ( err ) {
			yield colorsAnalyzeFailed( url );
		}
	}

	return {
		colorsAnalyzeStart,
		colorsAnalyzeSuccess,
		colorsAnalyzeFailed,
		analyzeColors,
	};
}

export type ActionCreators = ReturnType< typeof createActions >;

export type Action = ReturnType<
	| ActionCreators[ 'colorsAnalyzeStart' ]
	| ActionCreators[ 'colorsAnalyzeSuccess' ]
	| ActionCreators[ 'colorsAnalyzeFailed' ]
>;
