import wpcomRequest from 'wpcom-proxy-request';
import type { AnalyzeColorsResponse, Dispatch } from './types';

export const getSiteColors =
	( url: string ) =>
	async ( { dispatch }: Dispatch ) => {
		try {
			dispatch.analyzeColors( url );
			const data: AnalyzeColorsResponse = await wpcomRequest( {
				path: '/imports/url-analyzer/colors/?url=' + encodeURIComponent( url ),
				apiNamespace: 'wpcom/v2',
				apiVersion: '2',
			} );
			dispatch.receiveColors( data );
		} catch ( err ) {
			dispatch.receiveColorsFailed( url );
		}
	};
