/**
 * External dependencies
 */

import { memoize, omitBy, reduce, some, trim } from 'lodash';
import validator from 'is-my-json-valid';

const memoizedValidator = memoize( ( schema ) => validator( schema, { greedy: true } ) );

const processErrors = ( errors ) => {
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

const checkNullOrWhitespace = ( value ) => {
	return value && '' !== trim( value ) ? value : null;
};

const checkDuplicateName = ( name, boxNames ) => {
	name = checkNullOrWhitespace( name );
	return some( boxNames, ( boxName ) => boxName === name ) ? null : name;
};

const numberRegex = /^\d+(\.\d+)?$/;
const checkAndConvertNumber = ( value ) => {
	if ( ! numberRegex.test( value ) ) {
		return null;
	}

	return Number.parseFloat( value );
};

const preProcessPackageData = ( data, boxNames ) => {
	const boxWeight = checkAndConvertNumber( data.box_weight );
	let maxWeight = checkAndConvertNumber( data.max_weight );

	// Ensure that max weight exceeds the weight of the empty package.
	if ( boxWeight && maxWeight && maxWeight <= boxWeight ) {
		maxWeight = null;
	}

	const result = {
		name: checkDuplicateName( data.name, boxNames ),
		inner_dimensions: data.inner_dimensions,
		outer_dimensions: checkNullOrWhitespace( data.outer_dimensions ),
		box_weight: boxWeight,
		max_weight: maxWeight,
	};

	return omitBy( result, ( value ) => null === value );
};

export default ( packageData, boxNames, schema ) => {
	const validate = memoizedValidator( schema );
	const data = preProcessPackageData( packageData, boxNames );
	validate( data );
	return processErrors( validate.errors );
};
