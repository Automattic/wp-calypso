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
