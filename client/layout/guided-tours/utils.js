const noop = () => {};

const and = ( ...conditions ) => () => conditions.every( ( cond ) => cond() );

const not = ( fn ) => ( ...args ) => ! fn( ...args );

export { and, not, noop };
