/** @format */

/**
 * External dependencies
 */

import { memoize, omitBy, reduce, some, trim } from 'lodash';
import Ajv from 'ajv';
import draft04 from 'ajv/lib/refs/json-schema-draft-04.json';
const ajv = new Ajv( { messages: false, extendRefs: true, verbose: true, allErrors: true } );
ajv.addMetaSchema( draft04 );

const memoizedValidator = memoize( schema => ajv.compile( schema ) );

const processErrors = errors => {
	return reduce(
		errors,
		( result, value ) => {
			if ( value.field ) {
				const key = value.field.replace( 'data.', '' );
				Object.assign( result, { [ key ]: true, any: true } );
			}

			return result;
		},
		{}
	);
};

const checkNullOrWhitespace = value => {
	return value && '' !== trim( value ) ? value : null;
};

const checkDuplicateName = ( name, boxNames ) => {
	name = checkNullOrWhitespace( name );
	return some( boxNames, boxName => boxName === name ) ? null : name;
};

const numberRegex = /^\d+(\.\d+)?$/;
const checkAndConvertNumber = value => {
	if ( ! numberRegex.test( value ) ) {
		return null;
	}

	return Number.parseFloat( value );
};

const preProcessPackageData = ( data, boxNames ) => {
	const result = {
		name: checkDuplicateName( data.name, boxNames ),
		inner_dimensions: data.inner_dimensions,
		outer_dimensions: checkNullOrWhitespace( data.outer_dimensions ),
		box_weight: checkAndConvertNumber( data.box_weight ),
		max_weight: checkAndConvertNumber( data.max_weight ),
	};

	return omitBy( result, value => null === value );
};

export default ( packageData, boxNames, schema ) => {
	const validate = memoizedValidator( schema );
	const data = preProcessPackageData( packageData, boxNames );
	validate( data );
	return processErrors( validate.errors );
};
