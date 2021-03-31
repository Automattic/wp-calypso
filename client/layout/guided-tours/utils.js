const noop = () => {};

const and = ( ...conditions ) => () => conditions.every( ( cond ) => cond() );

const not = function ( func ) {
	return ! func.apply( null, arguments );
};

export { and, not, noop };
