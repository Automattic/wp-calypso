// The following polyfills exist for the draft-js editor, since
// we are unable to change its codebase and yet we are waiting
// on a solid solution for general IE polyfills
//
// They were borrowed and modified from MDN
//
// @TODO Remove these when we have a real Calypso polyfill solution

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/endsWith
if ( ! String.prototype.endsWith ) {
	String.prototype.endsWith = function( searchString, position ) {
		const subjectString = this.toString();
		if (
			typeof position !== 'number' ||
			! isFinite( position ) ||
			Math.floor( position ) !== position ||
			position > subjectString.length
		) {
			position = subjectString.length;
		}
		position -= searchString.length;
		const lastIndex = subjectString.indexOf( searchString, position );
		return lastIndex !== -1 && lastIndex === position;
	};
}

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/startsWith
if ( ! String.prototype.startsWith ) {
	String.prototype.startsWith = function( searchString, position ) {
		position = position || 0;
		return this.substr( position, searchString.length ) === searchString;
	};
}

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/fill
if ( ! Array.prototype.fill ) {
	Array.prototype.fill = function( value ) {
		// Steps 1-2.
		if ( this === null ) {
			throw new TypeError( 'this is null or not defined' );
		}

		const O = Object( this );

		// Steps 3-5.
		const len = O.length >>> 0;

		// Steps 6-7.
		const start = arguments[ 1 ];
		const relativeStart = start >> 0;

		// Step 8.
		let k = relativeStart < 0 ? Math.max( len + relativeStart, 0 ) : Math.min( relativeStart, len );

		// Steps 9-10.
		const end = arguments[ 2 ];
		const relativeEnd = end === undefined ? len : end >> 0;

		// Step 11.
		const final = relativeEnd < 0 ? Math.max( len + relativeEnd, 0 ) : Math.min( relativeEnd, len );

		// Step 12.
		while ( k < final ) {
			O[ k ] = value;
			k++;
		}

		// Step 13.
		return O;
	};
}
