export class PollTimeoutError extends Error {
	constructor( message = 'Timed out while polling.' ) {
		super( message );
		this.name = 'PollTimeoutError';
	}
}

export type PollUntilOptions = {
	maxAttempts?: number;
	intervalMs?: number;
	initialDelayMs?: number;
};

const wait = ( ms: number ) => new Promise< void >( ( resolve ) => setTimeout( resolve, ms ) );

/**
 * Repeatedly runs `check` on a fixed interval until it returns a defined value,
 * which is then returned. Errors thrown by `check` are treated as "not ready yet"
 * so transient request failures don't abort polling. Throws `PollTimeoutError`
 * once `maxAttempts` is exhausted without a result.
 */
export async function pollUntil< T >(
	check: ( attempt: number ) => Promise< T | undefined >,
	{ maxAttempts = 100, intervalMs = 3000, initialDelayMs = 0 }: PollUntilOptions = {}
): Promise< T > {
	if ( initialDelayMs > 0 ) {
		await wait( initialDelayMs );
	}

	for ( let attempt = 1; attempt <= maxAttempts; attempt++ ) {
		let result: T | undefined;
		try {
			result = await check( attempt );
		} catch {
			result = undefined;
		}

		if ( result !== undefined ) {
			return result;
		}

		if ( attempt < maxAttempts ) {
			await wait( intervalMs );
		}
	}

	throw new PollTimeoutError();
}
