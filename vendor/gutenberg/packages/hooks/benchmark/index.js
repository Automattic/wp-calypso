const Benchmark = require( 'benchmark' );
const hooks = require( '../' );

const suite = new Benchmark.Suite;

function myCallback() {}

hooks.addFilter( 'handled', 'myCallback', myCallback );

suite
	.add( 'handled', () => {
		hooks.applyFilters( 'handled' );
	} )
	.add( 'unhandled', () => {
		hooks.applyFilters( 'unhandled' );
	} )
	// eslint-disable-next-line no-console
	.on( 'cycle', ( event ) => console.log( event.target.toString() ) )
	.run( { async: true } );
