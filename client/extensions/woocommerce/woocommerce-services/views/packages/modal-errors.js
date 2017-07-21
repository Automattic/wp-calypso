/**
 * External dependencies
 */
import _ from 'lodash';
import validator from 'is-my-json-valid';

const memoizedValidator = _.memoize( ( schema ) => validator( schema, { greedy: true } ) );

const processErrors = ( errors ) => {
	return _.reduce( errors, ( result, value ) => {
		if ( value.field ) {
			const key = value.field.replace( 'data.', '' );
			Object.assign( result, { [ key ]: true, any: true } );
		}

		return result;
	}, {} );
};

const checkNullOrWhitespace = ( value ) => {
	return value && '' !== _.trim( value ) ? value : null;
};

const checkDuplicateName = ( name, boxNames ) => {
	name = checkNullOrWhitespace( name );
	return _.some( boxNames, ( boxName ) => boxName === name ) ? null : name;
};

const numberRegex = /^\d+(\.\d+)?$/;
const checkAndConvertNumber = ( value ) => {
	if ( ! numberRegex.test( value ) ) {
		return 'fail';
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

	return _.omitBy( result, ( value ) => null === value );
};

export default ( packageData, boxNames, schema ) => {
	const validate = memoizedValidator( schema );
	const data = preProcessPackageData( packageData, boxNames );
	validate( data );
	return processErrors( validate.errors );
};
