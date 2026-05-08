import { TOOL_ERROR_MESSAGE_MAX_LENGTH } from './constants';

export function getToolCallResultOk( result: unknown ): boolean {
	return !! result && typeof result === 'object' && ( result as { ok?: boolean } ).ok !== false;
}

export function getToolErrorMessage( result: unknown ): string | undefined {
	if ( ! result || typeof result !== 'object' ) {
		return;
	}
	const error = ( result as { error?: unknown } ).error;
	if ( typeof error !== 'string' || ! error ) {
		return;
	}
	return error.slice( 0, TOOL_ERROR_MESSAGE_MAX_LENGTH );
}

export function getErrorName( error: unknown ): string {
	return error instanceof Error && error.name ? error.name : 'unknown';
}

export function getErrorMessage( error: unknown ): string {
	return error instanceof Error && error.message ? error.message : 'Unknown error';
}
