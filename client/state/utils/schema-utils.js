/**
 * External dependencies
 */
import validator from 'is-my-json-valid';
import { forEach, get, isEmpty, isEqual } from 'lodash';

/**
 * Internal dependencies
 */
import { DESERIALIZE, SERIALIZE } from 'calypso/state/action-types';
import { getInitialState } from './get-initial-state';
import warn from 'calypso/lib/warn';

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
	const serializedInitialState = reducer( undefined, { type: SERIALIZE } );
	if ( isEqual( state, serializedInitialState ) ) {
		return true;
	}

	return isValidStateWithSchema( state, schema );
}

/**
 * Creates a schema-validating reducer
 *
 * Use this to wrap simple reducers with a schema-based
 * validation check when loading the initial state from
 * persistent storage.
 *
 * When this wraps a reducer with a known JSON schema,
 * it will intercept the DESERIALIZE action (on app boot)
 * and check if the persisted state is still valid state.
 * If so it will return the persisted state, otherwise
 * it will return the initial state computed from
 * passing the null action.
 *
 * @example
 * const ageReducer = ( state = 0, action ) =>
 *     GROW === action.type
 *         ? state + 1
 *         : state
 *
 * const schema = { type: 'number', minimum: 0 }
 *
 * export const age = withSchemaValidation( schema, ageReducer )
 *
 * ageReducer( -5, { type: DESERIALIZE } ) === -5
 * age( -5, { type: DESERIALIZE } ) === 0
 * age( 23, { type: DESERIALIZE } ) === 23
 *
 * @param {object} schema JSON-schema description of state
 * @param {Function} reducer normal reducer from ( state, action ) to new state
 * @returns {Function} wrapped reducer handling validation on DESERIALIZE
 */
export const withSchemaValidation = ( schema, reducer ) => {
	if ( process.env.NODE_ENV !== 'production' && ! schema ) {
		throw new Error( 'null schema passed to withSchemaValidation' );
	}

	const wrappedReducer = ( state, action ) => {
		if ( action.type === DESERIALIZE ) {
			if ( state === undefined ) {
				// If the state is not present in the stored data, initialize it with the
				// initial state. Note that calling `reducer( undefined, DESERIALIZE )` here
				// would be incorrect for reducers with custom deserialization. DESERIALIZE
				// expects plain JS object on input, but in this case, it would be defaulted
				// to the reducer's initial state. And that's a custom object, e.g.,
				// `Immutable.Map` or `PostQueryManager`.
				return getInitialState( reducer );
			}

			// If the stored state fails JSON schema validation, treat it as if it was
			// `undefined`, i.e., ignore it and replace with initial state.
			if ( ! isValidSerializedState( schema, reducer, state ) ) {
				return getInitialState( reducer );
			}
			// Otherwise, fall through to calling the regular reducer
		}

		return reducer( state, action );
	};

	//used to propagate actions properly when combined in combineReducersWithPersistence
	wrappedReducer.hasCustomPersistence = true;

	return wrappedReducer;
};
