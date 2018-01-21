/**
 * External dependencies
 */
import { isObject } from 'lodash';
import validator from 'is-my-json-valid';
import ObjectPath from 'objectpath';

/**
 * Internal dependencies
 */
import coerceFormValues from 'woocommerce/woocommerce-services/lib/utils/coerce-values';

export const EMPTY_ERROR = {
	level: 'error',
};
Object.freeze( EMPTY_ERROR );

/*
 * Errors from `is-my-json-valid` are paths to fields, all using `data` as the root.
 *
 * e.g.: `data.services.first_class_parcel.adjustment`
 *
 * This removes the `data.` prepending all errors, and transforms the array of errors into a tree-like structure.
 * Example:
 * Before parsing:
 * {
 * 	'data.services.first_class_parcel.adjustment': {},
 * 	'data.title': {},
 * 	'data.postalcode': {},
 * }
 *
 * After parsing:
 * {
 * 	'services': {
 * 		'first_class_parcel': {
 * 			'adjustment': {
 * 				'': {} // The actual error, it could have meta-data inside like the level of severity
 *	 		}
 * 		}
 * 	},
 * 	'title': {
 * 		'': {} // The actual error
 * 	},
 * 	'postalcode': {
 * 		'': {} // The actual error
 * 	}
 * }
 */
const parseErrorsList = ( errantFields ) => {
	if ( ! isObject( errantFields ) ) {
		return {};
	}

	const parsedErrors = {};
	Object.keys( errantFields ).forEach( ( fieldName ) => {
		const errorPath = ObjectPath.parse( fieldName );
		let newName = errorPath;
		if ( 'data' === errorPath[ 0 ] ) {
			newName = errorPath.slice( 1 );
		}
		let currentNode = parsedErrors;
		newName.forEach( ( pathChunk ) => {
			if ( ! currentNode[ pathChunk ] ) {
				currentNode[ pathChunk ] = {};
			}
			currentNode = currentNode[ pathChunk ];
		} );
		currentNode[ '' ] = errantFields[ fieldName ];
	} );
	return parsedErrors;
};

const getFirstFieldPathNode = ( fieldPath ) => {
	const fieldPathPieces = ObjectPath.parse( fieldPath );

	if ( 'data' === fieldPathPieces[ 0 ] ) {
		return fieldPathPieces[ 1 ] || null;
	}

	return fieldPathPieces[ 0 ];
};

let cachedValidator;
let cachedValidatorSchema;

const getRawFormErrors = ( schema, data, pristine ) => {
	if ( schema !== cachedValidatorSchema ) {
		cachedValidator = validator( schema, { greedy: true } );
		cachedValidatorSchema = schema;
	}
	const validate = cachedValidator;
	const coerced = coerceFormValues( schema, data );
	const success = validate( coerced );

	if ( ! success && validate.errors && validate.errors.length ) {
		const rawErrors = {};

		validate.errors.forEach( ( error ) => {
			// Ignore validation errors for fields that haven't been interacted with
			const errorField = getFirstFieldPathNode( error.field );

			if ( errorField && pristine[ errorField ] ) {
				return;
			}
			rawErrors[ error.field ] = EMPTY_ERROR;
		} );

		return rawErrors;
	}

	return {};
};

export default ( state, schema ) =>
	parseErrorsList( state.form.fieldsStatus || getRawFormErrors( schema, state.form.values, state.form.pristine ) );
