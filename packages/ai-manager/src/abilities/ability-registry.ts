/**
 * Ability definition for AI agent
 */
export interface Ability {
	/**
	 * Unique ability name/identifier
	 */
	name: string;
	/**
	 * Execute the ability with given parameters
	 * @param {any} params - Ability parameters
	 * @returns {Promise<any>} Ability result
	 */
	execute: ( params: any ) => Promise< any >;
	/**
	 * Optional JSON schema for ability parameters
	 */
	schema?: any;
	/**
	 * Optional description of what the ability does
	 */
	description?: string;
}

/**
 * Ability loader function - returns abilities asynchronously
 */
export type AbilityLoader = () => Promise< Ability[] >;

/**
 * Ability Registry
 *
 * Central registry for AI agent abilities with support for:
 * - Synchronous registration
 * - Asynchronous/lazy loading
 * - Dynamic ability management
 */
export class AbilityRegistry {
	private abilities: Map< string, Ability > = new Map();
	private loaders: AbilityLoader[] = [];
	private loadersInitialized = false;

	/**
	 * Register a single ability
	 * @param {Ability} ability - The ability to register
	 */
	registerAbility( ability: Ability ): void {
		if ( this.abilities.has( ability.name ) ) {
			// eslint-disable-next-line no-console
			console.warn(
				`[AbilityRegistry] Ability "${ ability.name }" is already registered. Overwriting.`
			);
		}
		this.abilities.set( ability.name, ability );
	}

	/**
	 * Register multiple abilities at once
	 * @param {Ability[]} abilities - Array of abilities to register
	 */
	registerAbilities( abilities: Ability[] ): void {
		abilities.forEach( ( ability ) => this.registerAbility( ability ) );
	}

	/**
	 * Register an async ability loader
	 * Loaders are called once during getAbilities() to lazy-load abilities
	 * @param {AbilityLoader} loader - Async function that returns abilities
	 */
	registerAbilitiesAsync( loader: AbilityLoader ): void {
		this.loaders.push( loader );
		this.loadersInitialized = false; // Mark as needing initialization
	}

	/**
	 * Unregister an ability by name
	 * @param {string} name - Name of the ability to remove
	 * @returns {boolean} True if ability was found and removed
	 */
	unregisterAbility( name: string ): boolean {
		return this.abilities.delete( name );
	}

	/**
	 * Get all registered abilities
	 * If async loaders are registered, they will be called once to populate abilities
	 * @returns {Promise<Ability[]>} Array of all abilities
	 */
	async getAbilities(): Promise< Ability[] > {
		// Load async abilities if not yet initialized
		if ( ! this.loadersInitialized && this.loaders.length > 0 ) {
			await this._loadAsyncAbilities();
		}

		return Array.from( this.abilities.values() );
	}

	/**
	 * Get a specific ability by name
	 * @param {string} name - Ability name
	 * @returns {Ability | undefined} The ability or undefined if not found
	 */
	getAbility( name: string ): Ability | undefined {
		return this.abilities.get( name );
	}

	/**
	 * Execute an ability by name
	 * @param {string} name - Ability name
	 * @param {any} params - Ability parameters
	 * @returns {Promise<any>} Ability execution result
	 * @throws {Error} If ability is not found
	 */
	async executeAbility( name: string, params: any ): Promise< any > {
		const ability = this.abilities.get( name );
		if ( ! ability ) {
			throw new Error( `[AbilityRegistry] Ability "${ name }" not found` );
		}

		try {
			return await ability.execute( params );
		} catch ( error ) {
			// eslint-disable-next-line no-console
			console.error( `[AbilityRegistry] Error executing ability "${ name }":`, error );
			throw error;
		}
	}

	/**
	 * Check if an ability is registered
	 * @param {string} name - Ability name
	 * @returns {boolean} True if ability exists
	 */
	hasAbility( name: string ): boolean {
		return this.abilities.has( name );
	}

	/**
	 * Clear all abilities and loaders
	 */
	clear(): void {
		this.abilities.clear();
		this.loaders = [];
		this.loadersInitialized = false;
	}

	/**
	 * Get number of registered abilities
	 * @returns {number} Count of abilities
	 */
	size(): number {
		return this.abilities.size;
	}

	/**
	 * Load all async ability loaders
	 * @private
	 */
	private async _loadAsyncAbilities(): Promise< void > {
		try {
			const loaderPromises = this.loaders.map( ( loader ) => loader() );
			const results = await Promise.allSettled( loaderPromises );

			results.forEach( ( result, index ) => {
				if ( result.status === 'fulfilled' ) {
					this.registerAbilities( result.value );
				} else {
					// eslint-disable-next-line no-console
					console.error( `[AbilityRegistry] Async loader ${ index } failed:`, result.reason );
				}
			} );

			this.loadersInitialized = true;
		} catch ( error ) {
			// eslint-disable-next-line no-console
			console.error( '[AbilityRegistry] Error loading async abilities:', error );
		}
	}
}

/**
 * Default global ability registry instance
 */
export const defaultAbilityRegistry = new AbilityRegistry();
