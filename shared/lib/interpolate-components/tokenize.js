
function identifyToken( item ) {
	// {{/example}}
	if ( item.match( /^\{\{\// ) ) {
		return {
			type: 'componentClose',
			value: item.replace( /\W/g, '' )
		};
	}
	// {{example /}}
	if ( item.match( /\/\}\}$/ ) ) {
		return {
			type: 'componentSelfClosing',
			value: item.replace( /\W/g, '' )
		};
	}
	// {{example}}
	if ( item.match( /^\{\{/ ) ) {
		return {
			type: 'componentOpen',
			value: item.replace( /\W/g, '' )
		};
	}
	return {
		type: 'string',
		value: item
	};
}

module.exports = function( translation ) {
	var tokenStrings = translation.split( /(\{\{\/?\s*\w+\s*\/?\}\})/g ); // split to components and strings
	return tokenStrings.map( identifyToken );
};
