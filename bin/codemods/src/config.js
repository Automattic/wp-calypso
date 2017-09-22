const jscodeshiftArgs = [
	'--extensions=js,jsx',
];

// Used primarily by 5to6-codemod transformations
const recastArgs = [
	'--useTabs=true',
	'--arrayBracketSpacing=true',
];

const recastOptions = {
	arrayBracketSpacing: true,
	objectCurlySpacing: true,
	quote: 'single',
	useTabs: true,
};

module.exports = {
	jscodeshiftArgs,
	recastArgs,
	recastOptions,
};
