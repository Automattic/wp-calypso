/**
 * External dependencies
 */
import _ from 'lodash';

const string = ( value ) => {
	return _.trim( value );
};

const leftPoint = /^\.\d+$/;
const rightPoint = /^\d+\.$/;

const number = ( value ) => {
	value = _.trim( value );
	if ( leftPoint.test( value ) ) {
		value = '0' + value;
	} else if ( rightPoint.test( value ) ) {
		value = value.slice( 0, value.length - 1 );
	}

	return value;
};

const dimensionRegex = /^\s*(\S+)\s*x\s*(\S+)\s*x\s*(\S+)\s*$/;
const dimensions = ( value ) => {
	const result = dimensionRegex.exec( value );
	if ( result ) {
		const dims = [ result[ 1 ], result[ 2 ], result[ 3 ] ];
		return dims.map( number ).join( ' x ' );
	}

	return value;
};

export default {
	string,
	number,
	dimensions,
};
