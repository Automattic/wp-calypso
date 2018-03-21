import { identity, isFunction } from 'lodash';

export default function( selector ) {
	if ( ! isFunction( selector ) ) {
		console.warn( 'something something selector is not a function...' );
		return selector;
	}

	const arity = selector.length;

    return function () {
		return [ ...arguments ].length === arity
      		? selector( ...arguments )
      		: recurse( [], [ ...arguments ] );
    };

  	function createRecurser ( accumulator, first ) {
	    return function () {
	      	return recurse( accumulator, [ ...arguments ] );
	    };
  	}

  	function recurse (accumulator, args) {
    	var nextAccumulator = accumulator.concat( args );
    	if ( nextAccumulator.length < arity ) {
      		return createRecurser( nextAccumulator );
    	} else {
			const state = [ ...nextAccumulator ].pop();
			const rest = [ ...nextAccumulator ].slice( 0, -1);

      		return selector.apply( this, [ state, ...rest ] );
    	}
  	}
};
