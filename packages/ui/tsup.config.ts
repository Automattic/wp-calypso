import { sassPlugin, postcssModules } from 'esbuild-sass-plugin';
import { defineConfig } from 'tsup';

export default defineConfig( {
	entry: [ 'src/index.ts' ],
	clean: true,
	splitting: true,
	experimentalDts: true,
	sourcemap: true,
	format: [ 'esm', 'cjs' ],
	outDir: 'dist',
	esbuildPlugins: [
		sassPlugin( {
			filter: /\.module\.(css|scss)$/,
			embedded: true,
			transform: postcssModules( {
				generateScopedName: 'a8cui-[contenthash:base64:6]',
			} ),
		} ),
	],
} );
