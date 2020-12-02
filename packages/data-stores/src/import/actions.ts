/**
 * Internal dependencies
 */
import type { ImportableSiteSuccessResponse, ImportableSiteErrorResponse } from './types';

export const setImportUrl = ( url: string ) => {
	return {
		type: 'SET_IMPORT_URL' as const,
		url,
	};
};

export const importableSite = () => ( {
	type: 'IMPORTABLE_SITE' as const,
} );

export const receiveImportableSite = ( response: ImportableSiteSuccessResponse ) => ( {
	type: 'RECEIVE_IMPORTABLE_SITE' as const,
	response,
} );

export const receiveImportableSiteFailed = ( error: ImportableSiteErrorResponse ) => ( {
	type: 'RECEIVE_IMPORTABLE_SITE_FAILED' as const,
	error,
} );

export const clearErrors = () => ( {
	type: 'CLEAR_ERRORS' as const,
} );

export type ImportAction = ReturnType<
	| typeof setImportUrl
	| typeof importableSite
	| typeof receiveImportableSite
	| typeof receiveImportableSiteFailed
	| typeof clearErrors
>;
