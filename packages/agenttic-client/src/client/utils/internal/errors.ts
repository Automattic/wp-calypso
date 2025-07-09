import type { JsonRpcResponse } from '../../types/index';
import { logger } from '../logger';

/**
 * Handle request errors with consistent logging and timeout cleanup
 *
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
 *
 * @param response  - The HTTP response
 * @param operation - Description of the operation
 */
export function validateHttpResponse(
	response: Response,
	operation: string = 'request'
): void {
	if ( ! response.ok ) {
		throw new Error( `HTTP error! status: ${ response.status }` );
	}
}

/**
 * Validate JSON-RPC response and return result
 *
 * @param data      - The JSON-RPC response
 * @param operation - Description of the operation
 * @return The validated result
 */
export function validateJsonRpcResponse< T >(
	data: JsonRpcResponse< T >,
	operation: string = 'request'
): T {
	if ( data.error ) {
		throw new Error( `A2A ${ operation } error: ${ data.error.message }` );
	}

	if ( ! data.result ) {
		throw new Error( `No result in ${ operation } response` );
	}

	return data.result;
}

/**
 * Validate streaming response
 *
 * @param response  - The HTTP response
 * @param operation - Description of the operation
 */
export function validateStreamingResponse(
	response: Response,
	operation: string = 'streaming request'
): void {
	validateHttpResponse( response, operation );

	if ( ! response.body ) {
		throw new Error( `No response body for ${ operation }` );
	}
}

/**
 * Create timeout handler with abort controller
 *
 * @param timeout   - Timeout in milliseconds
 * @param operation - Description of the operation
 * @return Timeout handler object
 */
export function createTimeoutHandler(
	timeout: number,
	operation: string = 'request'
): { timeoutId: number; controller: AbortController } {
	const controller = new AbortController();
	const timeoutId = setTimeout(
		() => controller.abort(),
		timeout
	) as unknown as number;
	return { timeoutId, controller };
}
