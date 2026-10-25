module.exports = {
	presets: [ '@babel/preset-typescript', '@babel/preset-env' ],
	// No JSX syntax in .ts files, where `<T>value` and `<T>( x ) =>` are TypeScript. Babel 7's TypeScript
	// plugin turned JSX off there itself; Babel 8's doesn't, and preset-react turns it on.
	overrides: [ { exclude: /\.ts$/, presets: [ '@babel/preset-react' ] } ],
	plugins: [],
};
