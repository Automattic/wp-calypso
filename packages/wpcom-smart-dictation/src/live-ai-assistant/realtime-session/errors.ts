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
	if ( error instanceof Error && error.name ) {
		return error.name;
	}

	if ( ! error || typeof error !== 'object' ) {
		return 'unknown';
	}

	const { code, name } = error as { code?: unknown; name?: unknown };
	if ( typeof code === 'string' && code ) {
		return code;
	}
	if ( typeof name === 'string' && name ) {
		return name;
	}

	return 'unknown';
}

export function getErrorMessage( error: unknown ): string {
	if ( error instanceof Error && error.message ) {
		return error.message;
	}

	if ( ! error || typeof error !== 'object' ) {
		return 'Unknown error';
	}

	const { error: errorMessage, message } = error as { error?: unknown; message?: unknown };
	if ( typeof message === 'string' && message ) {
		return message;
	}
	if ( typeof errorMessage === 'string' && errorMessage ) {
		return errorMessage;
	}

	return 'Unknown error';
}
