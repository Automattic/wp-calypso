const { parse: postcssParse } = require( 'postcss' );

// Simple merge for JS builtin types. That's all we need here, no need for lodash.
const mergeObjects = ( a, b ) => {
	if ( typeof a === 'object' && a !== null && typeof b === 'object' && b !== null ) {
		const ret = Array.isArray( a ) ? [ ...a ] : { ...a };
		for ( const k of Object.keys( b ) ) {
			ret[ k ] = mergeObjects( ret[ k ], b[ k ] );
		}
		return ret;
	}

	return typeof b === 'undefined' ? a : b;
};

const parse = ( css ) => {
	const ast = postcssParse( css );
	let result = {};

	ast.nodes.forEach( ( node ) => {
		if ( node.type === 'rule' ) {
			const declarations = {};

			node.nodes.forEach( ( dcl ) => {
				if ( dcl.type !== 'decl' ) {
					return;
				}
				declarations[ dcl.prop ] = dcl.value;
			} );

			result = mergeObjects( result, { [ node.selector ]: declarations } );
		}
	} );

	return result;
};

const toString = ( css ) => {
	let result = '';

	Object.keys( css ).forEach( ( selector ) => {
		result = `${ result }${ selector } {\n`;

		Object.keys( css[ selector ] ).forEach( ( prop ) => {
			result = `${ result }  ${ prop }: ${ css[ selector ][ prop ] };\n`;
		} );

		result = `${ result }}\n`;
	} );

	return result;
};

const addProp = ( diff, selector, prop, value ) => {
	if ( diff[ selector ] ) {
		diff[ selector ][ prop ] = value;
	} else {
		diff[ selector ] = {
			[ prop ]: value,
		};
	}

	return diff;
};

const cssDiff = ( source, reversed ) => {
	let isStringified = false;

	try {
		source = JSON.parse( source );
		reversed = JSON.parse( reversed );
		isStringified = true;
	} catch ( e ) {}

	const sourceObject = parse( source );
	const reversedObject = parse( reversed );
	let diff = {};

	Object.keys( reversedObject ).forEach( ( selector ) => {
		Object.keys( reversedObject[ selector ] ).forEach( ( prop ) => {
			if ( sourceObject[ selector ][ prop ] ) {
				if ( sourceObject[ selector ][ prop ] !== reversedObject[ selector ][ prop ] ) {
					diff = addProp( diff, selector, prop, reversedObject[ selector ][ prop ] );
				}
			} else {
				diff = addProp( diff, selector, prop, reversedObject[ selector ][ prop ] );
			}
		} );
	} );

	diff = toString( diff );

	if ( isStringified ) {
		diff = JSON.stringify( diff );
	}

	return diff;
};

module.exports = cssDiff;
module.exports.parse = parse;
module.exports.toString = toString;
