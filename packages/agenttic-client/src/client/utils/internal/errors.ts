import { logger } from '../logger';
import type { JsonRpcError, JsonRpcResponse } from '../../types/index';

/**
 * A request failure that keeps what the server said about it, so callers can
 * tell causes apart without parsing the message. `name` names client-side
 * causes: `TimeoutError` when the request timer fired, `StreamIncompleteError`
 * when a stream ended without a final result.
 */
export class AgentRequestError extends Error {
	/** The HTTP status of a failed response. */
	readonly status?: number;
	/** The JSON-RPC error's `data.code` when the server names one, else its numeric code. */
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
}

export function getAgentErrorDetails( error: unknown ): AgentErrorDetails {
	if ( ! ( error instanceof Error ) ) {
		return { name: 'Error' };
	}

	const { status, code } = error as { status?: unknown; code?: unknown };
	return {
		name: error.name,
		...( typeof status === 'number' && { status } ),
		...( ( typeof code === 'string' || typeof code === 'number' ) && { code } ),
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
 * Turns the abort the request timer caused into a `TimeoutError`, so it isn't
 * mistaken for a cancellation. Any other error passes through.
 * @param error         - The error that occurred
 * @param timeoutSignal - The signal the request timer aborts
 * @param externalSignal - The caller's own abort signal
 */
export function toTimeoutError(
	error: unknown,
	timeoutSignal: AbortSignal,
	externalSignal?: AbortSignal
): unknown {
	if ( ! timeoutSignal.aborted || externalSignal?.aborted ) {
		return error;
	}

	return new AgentRequestError( 'Request timed out', { name: 'TimeoutError' } );
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

/**
 * Validate HTTP response and throw if not ok
 * @param response   - The HTTP response
 */
export function validateHttpResponse( response: Response ): void {
	if ( ! response.ok ) {
		throw new AgentRequestError( `HTTP error! status: ${ response.status }`, {
			status: response.status,
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
export function validateStreamingResponse(
	response: Response,
	operation: string = 'streaming request'
): void {
	validateHttpResponse( response );

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
