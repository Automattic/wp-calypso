import type { ClientContext, ContextAdapter } from './context-adapter';

/**
 * Generic Context Adapter
 *
 * Provides basic context information (URL, pathname) without any environment-specific features.
 * Useful for generic implementations or as a fallback.
 */
export class GenericContextAdapter implements ContextAdapter {
	private environment: string;

	constructor( environment = 'generic' ) {
		this.environment = environment;
	}

	async getContext(): Promise< ClientContext > {
		return {
			url: window.location.href,
			pathname: window.location.pathname,
			environment: this.environment,
		};
	}

	getEnvironment(): string {
		return this.environment;
	}
}
