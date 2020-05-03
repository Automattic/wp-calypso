/**
 * External dependencies
 */
import { isObject, mapValues, omit, some } from 'lodash';
import validator from 'is-my-json-valid';
import ObjectPath from 'objectpath';
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import coerceFormValues from 'woocommerce/woocommerce-services/lib/utils/coerce-values';
import createSelector from 'lib/create-selector';
import { getShippingMethodSchema } from 'woocommerce/woocommerce-services/state/shipping-method-schemas/selectors';
import { getCurrentlyEditingShippingZone } from 'woocommerce/state/ui/shipping/zones/selectors';
import { getCurrentlyOpenShippingZoneMethod } from 'woocommerce/state/ui/shipping/zones/methods/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';

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

const getRawFormErrors = ( schema, data, fieldsToCheck ) => {
	const validate = validator( schema, { greedy: true } );
	const coerced = coerceFormValues( schema, data );
	const success = validate( coerced );
	const rawErrors = {};

	if ( ! success && validate.errors && validate.errors.length ) {
		validate.errors.forEach( ( error ) => {
			// Ignore validation errors for fields that haven't been interacted with
			const errorField = getFirstFieldPathNode( error.field );

			if ( errorField && ! fieldsToCheck[ errorField ] ) {
				return;
			}
			rawErrors[ error.field ] = EMPTY_ERROR;
		} );
	}
	// This can't be validated by the schema
	if ( fieldsToCheck.services && ! some( data.services, 'enabled' ) ) {
		rawErrors.services = translate( 'Select at least one service.' );
	}

	return rawErrors;
};

export default createSelector(
	( state, siteId = getSelectedSiteId( state ) ) => {
		const zone = getCurrentlyEditingShippingZone( state, siteId );
		if ( ! zone || ! zone.methods || ! zone.methods.currentlyEditingId ) {
			return {};
		}
		const method = getCurrentlyOpenShippingZoneMethod( state, siteId );
		const schema = getShippingMethodSchema( state, method.methodType, siteId ).formSchema;
		const editedFields = omit( zone.methods.currentlyEditingChanges, [
			'id',
			'methodType',
			'enabled',
		] );
		const fieldsToCheck = mapValues( editedFields, () => true );
		const rawErrors = getRawFormErrors( schema, method, fieldsToCheck );
		return parseErrorsList( rawErrors );
	},
	( state, siteId = getSelectedSiteId( state ) ) => {
		return [ siteId, getCurrentlyEditingShippingZone( state, siteId ) ];
	}
);
