const jscodeshiftArgs = [
	'--extensions=js,jsx',
];

// Used primarily by 5to6-codemod transformations
const recastArgs = [
	'--useTabs=true',
	'--arrayBracketSpacing=true',
];

module.exports = {
	jscodeshiftArgs,
	recastArgs,
};
