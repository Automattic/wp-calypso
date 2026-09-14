const RuleTester = require( 'eslint' ).RuleTester;
const rule = require( '../../../lib/rules/jsx-async-load-require-top-level' );

new RuleTester( {
	parser: require.resolve( '@babel/eslint-parser' ),
	parserOptions: {
		ecmaFeatures: { jsx: true },
		sourceType: 'module',
	},
} ).run( 'jsx-async-load-require-top-level', rule, {
	valid: [
		{
			code: `
				const loadComponent = () => import( './component' );
				<AsyncLoad require={ loadComponent } />;
			`,
		},
		{
			code: `
				const loadComponent = () => import( './component' );
				<AsyncLoad require={ loadComponent } placeholder={ null } />;
			`,
		},
		{
			code: '<Other require={ () => import( "./foo" ) } />',
		},
	],

	invalid: [
		{
			code: '<AsyncLoad require={ () => import( "./foo" ) } />',
			errors: [ { messageId: 'requireTopLevel' } ],
		},
		{
			code: '<AsyncLoad require={ function() { return import( "./foo" ); } } />',
			errors: [ { messageId: 'requireTopLevel' } ],
		},
		{
			code: `
				const load = () => import( './foo' );
				<AsyncLoad require={ load() } />;
			`,
			errors: [ { messageId: 'requireTopLevel' } ],
		},
		{
			code: `
				function MyComponent( { loadIt } ) {
					return <AsyncLoad require={ loadIt } />;
				}
			`,
			errors: [ { messageId: 'requireTopLevel' } ],
		},
		{
			code: `
				function MyComponent() {
					const load = () => import( './foo' );
					return <AsyncLoad require={ load } />;
				}
			`,
			errors: [ { messageId: 'requireTopLevel' } ],
		},
	],
} );
