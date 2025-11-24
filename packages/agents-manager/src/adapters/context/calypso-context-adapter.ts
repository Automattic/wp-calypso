import type { ClientContext, ContextAdapter } from './context-adapter';

/**
 * Calypso Context Adapter
 *
 * Provides context information from Calypso environment.
 * Can integrate with Calypso's routing, Redux store, and other Calypso-specific features.
 */
export class CalypsoContextAdapter implements ContextAdapter {
	private environment: string;
	private additionalContextProvider?: () => Promise< Record< string, unknown > >;

	/**
	 * Create a new Calypso Context Adapter
	 * @param {string} environment - Environment identifier (e.g., 'calypso-help-center')
	 * @param {Function} additionalContextProvider - Optional function to provide additional context
	 */
	constructor(
		environment = 'calypso',
		additionalContextProvider?: () => Promise< Record< string, unknown > >
	) {
		this.environment = environment;
		this.additionalContextProvider = additionalContextProvider;
	}

	async getContext(): Promise< ClientContext > {
		const context: ClientContext = {
			url: window.location.href,
			pathname: window.location.pathname,
			environment: this.environment,
		};

		// Add additional context if provider is available
		if ( this.additionalContextProvider ) {
			try {
				const additionalData = await this.additionalContextProvider();
				if ( additionalData && Object.keys( additionalData ).length > 0 ) {
					context.additionalData = additionalData;
				}
			} catch ( error ) {
				// eslint-disable-next-line no-console
				console.warn( '[CalypsoContextAdapter] Error getting additional context:', error );
			}
		}

		return context;
	}

	getEnvironment(): string {
		return this.environment;
	}
}
