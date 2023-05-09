import { getInitialState } from '@automattic/state-utils';
import warn from '@wordpress/warning';
import validator from 'is-my-json-valid';
import { forEach, get, isEmpty, isEqual } from 'lodash';
import { serialize, deserialize } from './serialize';
import { withPersistence } from './with-persistence';

export function isValidStateWithSchema( state, schema, debugInfo ) {
	const validate = validator( schema, {
		greedy: process.env.NODE_ENV !== 'production',
		verbose: process.env.NODE_ENV !== 'production',
	} );
	const valid = validate( state );
	if ( ! valid && process.env.NODE_ENV !== 'production' ) {
		const msgLines = [ 'State validation failed.', 'State: %o', '' ];
		const substitutions = [ state ];

		forEach( validate.errors, ( { field, message, schemaPath, value } ) => {
			// data.myField is required
			msgLines.push( '%s %s' );
			substitutions.push( field, message );

			// Found: { my: 'state' }
			msgLines.push( 'Found: %o' );
			substitutions.push( value );

			// Violates rule: { type: 'boolean' }
			if ( ! isEmpty( schemaPath ) ) {
				msgLines.push( 'Violates rule: %o' );
				substitutions.push( get( schema, schemaPath ) );
			}
			msgLines.push( '' );
		} );

		if ( ! isEmpty( debugInfo ) ) {
			msgLines.push( 'Source: %o' );
			substitutions.push( debugInfo );
		}

		warn( msgLines.join( '\n' ), ...substitutions );
	}
	return valid;
}

function isValidSerializedState( schema, reducer, state ) {
	// The stored state is often equal to initial state of the reducer. Because initial state
	// is always valid, we can validate much faster by just comparing the two states. The full
	// JSON schema check is much slower and we do it only on nontrivial states.
	// Note that we need to serialize the initial state to make a correct check. For reducers
	// with custom persistence, the initial state can be arbitrary non-serializable object. We
	// need to compare two serialized objects.
	const serializedInitialState = serialize( reducer, getInitialState( reducer ) );
	if ( isEqual( state, serializedInitialState ) ) {
		return true;
	}

	return isValidStateWithSchema( state, schema );
}

/**
 * Creates a schema-validating reducer
 *
 * Use this to wrap simple reducers with a schema-based validation check when loading
 * the initial state from persistent storage.
 *
 * The wrapped reducer implements the `deserialize` method and checks if the persisted state
 * is a valid state. If yes, it returns the persisted state (and calls the inner reducer's
 * `deserialize` method if defined). Otherwise it returns the initial state of the inner reducer.
 *
 * @example
 * ```js
 * const ageReducer = ( state = 0, action ) => GROW === action.type ? state + 1 : state
 *
 * const schema = { type: 'number', minimum: 0 }
 *
 * export const age = withSchemaValidation( schema, ageReducer );
 *
 * expect( deserialize( ageReducer, -5 ) ).toBe( -5 ); // no schema check
 * expect( deserialize( age, -5 ) ).toBe( 0 ); // schema check failed, return initial state
 * expect( deserialize( age,  23 ) ).toBe( 23 ); // schema check passed
 * ```
 * @param {Object} schema JSON-schema description of state
 * @param {Function} reducer normal reducer from ( state, action ) to new state
 * @returns {import('redux').Reducer} wrapped reducer handling validation on `.deserialize()`
 */
export const withSchemaValidation = ( schema, reducer ) => {
	if ( process.env.NODE_ENV !== 'production' && ! schema ) {
		throw new Error( 'null schema passed to withSchemaValidation' );
	}

	// Add default identity-mapping persistence to the wrapped reducer. Prevent
	// it to default to no-persistence.
	const persistingReducer = withPersistence( reducer );

	return withPersistence( persistingReducer, {
		deserialize( persisted ) {
			if ( persisted === undefined ) {
				// If the state is not present in the stored data, initialize it with the
				// initial state.
				return getInitialState( persistingReducer );
			}

			// If the stored state fails JSON schema validation, treat it as if it was
			// `undefined`, i.e., ignore it and replace with initial state.
			if ( ! isValidSerializedState( schema, persistingReducer, persisted ) ) {
				return getInitialState( persistingReducer );
			}

			// Otherwise, if the state is valid, deserialize it with the inner reducer.
			return deserialize( persistingReducer, persisted );
		},
	} );
};
