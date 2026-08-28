export interface WPError extends Error {
	status: number;
	statusCode: number;
	error?: string;
	[ key: string ]: unknown;
}

export function isWpError( error: unknown ): error is WPError {
	return (
		error instanceof Error &&
		'status' in error &&
		typeof error.status === 'number' &&
		'statusCode' in error &&
		typeof error.statusCode === 'number' &&
		( 'error' in error ? typeof error.error === 'string' : true )
	);
}

export function isInaccessibleJetpackError( error: unknown ): boolean {
	if ( error instanceof Error ) {
		if ( error.message.startsWith( 'The Jetpack site is inaccessible' ) ) {
			return true;
		}
		if (
			error.name === 'UnauthorizedError' &&
			error.message.startsWith( 'API calls to this blog have been disabled' )
		) {
			return true;
		}
	}
	return false;
}

export type AuthErrorKind = 'expired' | 'forbidden';

/**
 * Classifies an auth failure, or returns null when the error is something else.
 *
 * `expired` means the request was not authenticated at all; `forbidden` means it
 * was, but the account may not do this. The two are worth telling apart because
 * only the first is recoverable by logging in again.
 *
 * v1 endpoints report the code in `error`, WP REST ones in `code`.
 */
export function classifyAuthError( error: unknown ): AuthErrorKind | null {
	if ( ! isWpError( error ) ) {
		return null;
	}

	const code = error.error ?? error.code;
	if ( code !== 'authorization_required' && code !== 'rest_forbidden' ) {
		return null;
	}

	return error.statusCode === 401 ? 'expired' : 'forbidden';
}
