export class DashboardDataError extends Error {
	constructor(
		public code: string,
		cause?: unknown
	) {
		const message = cause instanceof Error ? cause.message : `Error: ${ cause }`;
		super( message, { cause } );
		this.name = 'DashboardDataError';

		// Fix prototype chain (important for instanceof to work reliably)
		Object.setPrototypeOf( this, new.target.prototype );
	}
}

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
