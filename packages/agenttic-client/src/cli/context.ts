import type { ClientContext, ContextProvider } from '../types/index';
import { getClientContext } from './mocks/clientContext';

/**
 * CLI Context Provider - provides mock client context for testing
 */
export class CLIContextProvider implements ContextProvider {
	getClientContext(): ClientContext {
		return getClientContext();
	}
}

/**
 * Create a CLI context provider instance
 */
export function createCLIContextProvider(): CLIContextProvider {
	return new CLIContextProvider();
}
