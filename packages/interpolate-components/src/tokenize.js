function identifyToken( item ) {
	// {{/example}}
	if ( item.startsWith( '{{/' ) ) {
		return {
			type: 'componentClose',
			value: item.replace( /\W/g, '' ),
		};
	}
	// {{example /}}
	if ( item.endsWith( '/}}' ) ) {
		return {
			type: 'componentSelfClosing',
			value: item.replace( /\W/g, '' ),
		};
	}
	// {{example}}
	if ( item.startsWith( '{{' ) ) {
		return {
			type: 'componentOpen',
			value: item.replace( /\W/g, '' ),
		};
	}
	return {
		type: 'string',
		value: item,
	};
}

export default function tokenize( mixedString ) {
	const tokenStrings = mixedString.split( /(\{\{\/?\s*\w+\s*\/?\}\})/g ); // split to components and strings
	return tokenStrings.map( identifyToken );
}
