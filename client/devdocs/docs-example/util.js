
const getComponentName = docsExample => {
	if ( ! docsExample ) {
		return '';
	}

	return ( docsExample.type.displayName || docsExample.type.name )
		.replace( /Example$/, '' );
};

const slugToCamelCase = name => {
	return name
	.replace( /-([a-z])/g, s => s[ 1 ].toUpperCase() )
	.replace( /^\w/, s => s.toUpperCase() );
};

const camelCaseToSlug = name => {
	return name
		.replace( /\.?([A-Z])/g, ( x, y ) => '-' + y.toLowerCase() )
		.replace( /^-/, '' );
};

export {
	getComponentName,
	slugToCamelCase,
	camelCaseToSlug
};
