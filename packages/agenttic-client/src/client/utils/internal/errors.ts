import { logger } from '../logger';
import type { JsonRpcError, JsonRpcResponse } from '../../types/index';

/**
 * A request failure that keeps what the server said about it, so callers can
 * tell causes apart without parsing the message. A stream that ended without
 * a final result is named `StreamIncompleteError`.
 */
export class AgentRequestError extends Error {
	/** The HTTP status of a failed response. */
	readonly status?: number;
	/** The server's error code: from the JSON-RPC error, or a failed response's JSON body. */
	readonly code?: string | number;

	constructor(
		message: string,
		{ name, status, code }: { name?: string; status?: number; code?: string | number } = {}
	) {
		super( message );
		this.name = name ?? 'AgentRequestError';
		this.status = status;
		this.code = code;
	}
}

/**
 * The structured fields of a failed request, without its message.
 */
export interface AgentErrorDetails {
	/** The error's `name`, such as `TypeError` for a fetch that never got a response. */
	name: string;
	status?: number;
	code?: string | number;
	/** Set on the `AbortError` of a request the client's own timer cut off. */
	timedOut?: true;
}

function readErrorCode( value: unknown ): string | number | undefined {
	return ( typeof value === 'string' && value !== '' ) || typeof value === 'number'
		? value
		: undefined;
}

export function getAgentErrorDetails( error: unknown ): AgentErrorDetails {
	if ( ! ( error instanceof Error ) ) {
		return { name: 'Error' };
	}

	const { status, timedOut } = error as {
		status?: unknown;
		timedOut?: unknown;
	};
	// Only a request error carries a server code. A DOMException's legacy numeric
	// `code` (AbortError is 20) is not one, and must not be recorded.
	const errorCode = error instanceof AgentRequestError ? readErrorCode( error.code ) : undefined;
	return {
		name: error.name,
		...( typeof status === 'number' && { status } ),
		...( errorCode !== undefined && { code: errorCode } ),
		...( timedOut === true && { timedOut } ),
	};
}

/**
 * A JSON-RPC error's `data.code` when the server names one, else its numeric code.
 * @param error - The JSON-RPC error
 */
export function getJsonRpcErrorCode( error: JsonRpcError ): string | number {
	const data = error.data as { code?: unknown } | undefined;
	return typeof data?.code === 'string' && data.code !== '' ? data.code : error.code;
}

/**
 * Marks the timer's `AbortError` with `timedOut`, so it can be told from a
 * cancellation. It stays an `AbortError`, so callers that ignore aborts still
 * do. Any other error passes through, even if the timer has already fired.
 * @param error          - The error that occurred
 * @param timeoutSignal  - The signal the request timer aborts
 * @param externalSignal - The caller's own abort signal
 */
export function markTimeoutError(
	error: unknown,
	timeoutSignal: AbortSignal,
	externalSignal?: AbortSignal
): unknown {
	if (
		! timeoutSignal.aborted ||
		externalSignal?.aborted ||
		! ( error instanceof Error ) ||
		error.name !== 'AbortError'
	) {
		return error;
	}

	return Object.assign( error, { timedOut: true } );
}

/**
 * Handle request errors with consistent logging and timeout cleanup
 * @param error     - The error that occurred
 * @param timeoutId - Timeout ID to clear
 * @param operation - Description of the operation
 */
export function handleRequestError(
	error: unknown,
	timeoutId: number,
	operation: string = 'request'
): never {
	clearTimeout( timeoutId );

	logger( '%s failed with error: %O', operation, error );
	if ( error instanceof Error ) {
		logger( 'Error message: %s', error.message );
		logger( 'Error stack: %s', error.stack );
	}

	throw error;
}

// Headers have already arrived, and the request timer is cleared before this
// read, so a stalled error body needs its own bound.
const ERROR_BODY_READ_MS = 1000;

/**
 * The code a failed response's JSON body names: WP REST's `code`, or
 * `error.code` / `data.code`. Read from a clone, so the body stays unread.
 * Gives up when the body does not arrive, and reports the status alone.
 * @param response - The failed HTTP response
 */
async function readResponseErrorCode( response: Response ): Promise< string | number | undefined > {
	const clone = response.clone();
	let timer: ReturnType< typeof setTimeout > | undefined;
	// A body that isn't JSON rejects; that is "no code", not a failure of this read.
	const body = clone.json().then(
		( parsed ) => parsed,
		() => undefined
	);
	try {
		const parsed = await Promise.race( [
			body,
			new Promise< undefined >( ( resolve ) => {
				timer = setTimeout( () => resolve( undefined ), ERROR_BODY_READ_MS );
			} ),
		] );
		const record = parsed as {
			code?: unknown;
			error?: { code?: unknown };
			data?: { code?: unknown };
		} | null;
		return (
			readErrorCode( record?.code ) ??
			readErrorCode( record?.error?.code ) ??
			readErrorCode( record?.data?.code )
		);
	} finally {
		clearTimeout( timer );
	}
}

/**
 * Validate HTTP response and throw if not ok
 * @param response   - The HTTP response
 */
export async function validateHttpResponse( response: Response ): Promise< void > {
	if ( ! response.ok ) {
		throw new AgentRequestError( `HTTP error! status: ${ response.status }`, {
			status: response.status,
			code: await readResponseErrorCode( response ),
		} );
	}
}

/**
 * Validate JSON-RPC response and return result
 * @param data      - The JSON-RPC response
 * @param operation - Description of the operation
 * @returns The validated result
 */
export function validateJsonRpcResponse< T >(
	data: JsonRpcResponse< T >,
	operation: string = 'request'
): T {
	if ( data.error ) {
		throw new AgentRequestError( `Protocol ${ operation } error: ${ data.error.message }`, {
			code: getJsonRpcErrorCode( data.error ),
		} );
	}

	if ( ! data.result ) {
		throw new Error( `No result in ${ operation } response` );
	}

	return data.result;
}

/**
 * Validate streaming response
 * @param response  - The HTTP response
 * @param operation - Description of the operation
 */
export async function validateStreamingResponse(
	response: Response,
	operation: string = 'streaming request'
): Promise< void > {
	await validateHttpResponse( response );

	if ( ! response.body ) {
		throw new Error( `No response body for ${ operation }` );
	}
}

/**
 * Create timeout handler with abort controller
 * @param timeout    - Timeout in milliseconds
 * @returns Timeout handler object
 */
export function createTimeoutHandler( timeout: number ): {
	timeoutId: number;
	controller: AbortController;
} {
	const controller = new AbortController();
	const timeoutId = setTimeout( () => controller.abort(), timeout ) as unknown as number;
	return { timeoutId, controller };
}
