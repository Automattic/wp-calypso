/**
 * External dependencies
 */

/**
 * Internal dependencies
 */

// Initialize global registry.
const defaultRegistry = {};

/**
 * Registers a set of action types by prefix.
 *
 * @param { string } prefix - The prefix or namespace for the action types.
 * @param { Array } typeNames - An array of string type names for each action type.
 * @param { Object } registry - (optional) Registry with which to register,
 *                   Defaults to internal global registry.
 * @return { Object } An object with two properties:
 *                    types: Type mappings ( <typeName>: <full action name> )
 *                    actions: Action mappings ( <typeName: <redux-actions action> )
 */
export function registerActionTypes( prefix, typeNames, registry = defaultRegistry ) {
	if ( prefix in registry ) {
		throw new Error( 'registerActionTypes(): prefix "' + prefix + '" already exists in registry' );
	}

	const types = {};
	const actions = {};

	for ( const name of typeNames ) {
		types[ name ] = prefix + '_' + name;
		actions[ name ] = ( payload ) => {
			return { type: types[ name ], payload };
		};
	}

	registry[ prefix ] = { types, actions };
	return registry[ prefix ];
}

