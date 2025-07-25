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
