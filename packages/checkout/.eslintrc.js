// The package must stay host-agnostic: host behavior enters through the host
// context the embedding app supplies, server data through `@automattic/api-queries`.
const LEGACY_APP = [ 'calypso/*', 'client/*' ];
const REDUX = [
	'redux',
	'redux/*',
	'react-redux',
	'react-redux/*',
	'redux-thunk',
	'redux-thunk/*',
];

// `no-restricted-imports` and `no-restricted-modules` only see static `import`
// and `require`, so `import()` needs its own selector.
const DYNAMIC_IMPORT_ROOTS = [ 'calypso', 'client', 'redux', 'react-redux', 'redux-thunk' ];
const dynamicImportSelector = `ImportExpression > Literal[value=/^(${ DYNAMIC_IMPORT_ROOTS.join(
	'|'
) })(\\/|$)/]`;

module.exports = {
	rules: {
		'no-restricted-imports': [
			'error',
			{
				patterns: [
					{
						group: LEGACY_APP,
						message: 'Legacy app imports are not allowed in @automattic/checkout.',
					},
					{
						group: REDUX,
						message: 'Redux is not allowed in @automattic/checkout.',
					},
				],
			},
		],
		'no-restricted-modules': [ 'error', { patterns: [ ...LEGACY_APP, ...REDUX ] } ],
		'no-restricted-syntax': [
			'error',
			{
				selector: dynamicImportSelector,
				message:
					'Legacy app and Redux imports are not allowed in @automattic/checkout, dynamic ones included.',
			},
		],
	},
};
