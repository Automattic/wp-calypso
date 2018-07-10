// Set up `wp.*` aliases.  Handled by Webpack outside of the test build.
global.wp = {
	shortcode: {
		next() {},
		regexp: jest.fn().mockReturnValue( new RegExp() ),
	},
};

Object.defineProperty( global.wp, 'element', {
	get: () => require( 'packages/element' ),
} );
Object.defineProperty( global.wp, 'blocks', {
	get: () => require( 'blocks' ),
} );
