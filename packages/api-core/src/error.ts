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
	return error instanceof Error && error.message.startsWith( 'The Jetpack site is inaccessible' );
}
