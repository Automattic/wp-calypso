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

export default function( mixedString ) {
	const tokenStrings = mixedString.split( /(\{\{\/?\s*\w+\s*\/?\}\})/g ); // split to components and strings
	return tokenStrings.map( identifyToken );
};
