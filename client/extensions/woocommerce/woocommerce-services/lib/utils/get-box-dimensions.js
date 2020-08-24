export default ( box ) => {
	let dimensions;
	if ( box.outer_dimensions ) {
		dimensions = box.outer_dimensions.match( /([-.0-9]+).+?([-.0-9]+).+?([-.0-9]+)/ );
	} else {
		dimensions = box.inner_dimensions.match( /([-.0-9]+).+?([-.0-9]+).+?([-.0-9]+)/ );
	}

	const [ length, width, height ] = dimensions.slice( 1 ).map( Number );

	return { length, width, height };
};
