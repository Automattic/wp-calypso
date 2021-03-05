const jscodeshiftArgs = [ '--extensions=js,jsx' ];

// Used primarily by 5to6-codemod transformations
const recastArgs = [ '--useTabs=true', '--arrayBracketSpacing=true' ];

const recastOptions = {
	arrayBracketSpacing: true,
	objectCurlySpacing: true,
	quote: 'single',
	useTabs: true,
	trailingComma: {
		objects: true,
		arrays: true,
		parameters: false,
	},
};

const commonArgs = {
	'5to6': [
		// Recast options via 5to6
		...recastArgs,
	],
	react: [
		// Recast options via react-codemod
		`--printOptions=${ JSON.stringify( recastOptions ) }`,
	],
};

const codemodArgs = {
	'commonjs-exports': [
		...commonArgs[ '5to6' ],
		`--transform=${ require.resolve( '5to6-codemod/transforms/exports.js' ) }`,
	],

	'commonjs-imports': [
		...commonArgs[ '5to6' ],
		`--transform=${ require.resolve( '5to6-codemod/transforms/cjs.js' ) }`,
	],

	'commonjs-imports-hoist': [
		...commonArgs[ '5to6' ],
		`--transform=${ require.resolve( '5to6-codemod/transforms/cjs.js' ) }`,
		'--hoist=true',
	],

	'named-exports-from-default': [
		...commonArgs[ '5to6' ],
		`--transform=${ require.resolve( '5to6-codemod/transforms/named-export-generation.js' ) }`,
	],

	'react-create-class': [
		...commonArgs.react,
		`--transform=${ require.resolve( 'react-codemod/transforms/class.js' ) }`,

		// react-codemod options
		'--pure-component=true',
		'--mixin-module-name="react-pure-render/mixin"', // Your days are numbered, pure-render-mixin!
	],

	'react-proptypes': [
		...commonArgs.react,
		`--transform=${ require.resolve(
			'react-codemod/transforms/React-PropTypes-to-prop-types.js'
		) }`,
	],
};

module.exports = {
	codemodArgs,
	jscodeshiftArgs,
	recastOptions,
};
