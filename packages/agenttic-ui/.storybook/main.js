import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mergeConfig } from 'vite';

// The framework is installed in this package's node_modules, which Storybook (hoisted to the
// repo root) can't see from its own location.
const getAbsolutePath = ( value ) =>
	dirname( fileURLToPath( import.meta.resolve( `${ value }/package.json` ) ) );

const config = {
	stories: [ '../src/**/*.stories.@(js|jsx|ts|tsx)', '../src/**/*.mdx' ],
	addons: [ '@storybook/addon-a11y', '@storybook/addon-docs' ],
	framework: {
		name: getAbsolutePath( '@storybook/react-vite' ),
		options: {},
	},
	typescript: {
		check: false,
		reactDocgen: 'react-docgen-typescript',
		reactDocgenTypescriptOptions: {
			shouldExtractLiteralValuesFromEnum: true,
			propFilter: ( prop ) =>
				prop.parent ? ! /node_modules/.test( prop.parent.fileName ) : true,
		},
	},
	async viteFinal( config ) {
		return mergeConfig( config, {
			css: {
				modules: {
					localsConvention: 'camelCaseOnly',
					generateScopedName: '[name]__[local]___[hash:base64:5]',
				},
			},
			optimizeDeps: {
				include: [ 'react', 'react-dom', 'react/jsx-dev-runtime', '@mdx-js/react' ],
			},
			define: {
				global: 'globalThis',
			},
		} );
	},
};

export default config;
