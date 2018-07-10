/**
 * External dependencies
 */
import postcss from 'postcss';

/**
 * Internal dependencies
 */
import plugin from '../src';

/**
 * Module constants
 */
const defaultOptions = {
	defaults: {
		main: '#ccc',
		highlight: 'red',
	},
	themes: {
		dark: {
			main: '#000',
			highlight: 'blue',
		},
		light: {
			main: '#FFF',
			highlight: 'green',
		},
	},
	from: undefined,
};

const run = ( input, opts = defaultOptions ) => {
	return postcss( [ plugin( opts ) ] ).process( input, { from: undefined } );
};

describe( 'postcss-themes', () => {
	it( 'replaces the default color and generate theme colors', () => {
		return run( 'a{ color: theme( main ) }' ).then( ( result ) => {
			expect( result.css ).toMatchSnapshot();
			expect( result.warnings() ).toHaveLength( 0 );
		} );
	} );

	it( 'replaces multiple rules in the same declaration', () => {
		return run( 'a{ background: linear-gradient( -45deg, theme(main) 50%, theme(highlight) 50% ) }' ).then( ( result ) => {
			expect( result.css ).toMatchSnapshot();
			expect( result.warnings() ).toHaveLength( 0 );
		} );
	} );

	it( 'gather several declaration in a unique rule', () => {
		return run( 'a{ color: theme( main ); background: theme(highlight); }' ).then( ( result ) => {
			expect( result.css ).toMatchSnapshot();
			expect( result.warnings() ).toHaveLength( 0 );
		} );
	} );

	it( 'add the prefix selector to all subselectors', () => {
		return run( 'a, span{ color: theme( main ) }' ).then( ( result ) => {
			expect( result.css ).toMatchSnapshot();
			expect( result.warnings() ).toHaveLength( 0 );
		} );
	} );
} );
