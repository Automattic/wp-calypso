import { createRequire } from 'module';
import type { Plugin } from 'vite';

const require = createRequire( import.meta.url );

interface Options {
	/** Only process CSS files matching this pattern. Defaults to all CSS files. */
	test?: RegExp;
	/** rtlcss options passed to rtlcss.process(). */
	rtlOptions?: object;
	/** rtlcss plugins. */
	rtlPlugins?: unknown[];
}

/**
 * Generates a `.rtl.css` sibling for every emitted `.css` file by running
 * the CSS through rtlcss. Mirrors @automattic/webpack-rtl-plugin.
 */
export function vitePluginRtlCss( options: Options = {} ): Plugin {
	const { test, rtlOptions = {}, rtlPlugins = [] } = options;
	const rtlcss = require( 'rtlcss' );

	return {
		name: 'calypso-rtl-css',
		apply: 'build',
		enforce: 'post',

		generateBundle( _outputOptions, bundle ) {
			const cssRe = /\.css$/;

			for ( const [ fileName, asset ] of Object.entries( bundle ) ) {
				if ( asset.type !== 'asset' ) {
					continue;
				}
				if ( ! cssRe.test( fileName ) ) {
					continue;
				}
				if ( test && ! test.test( fileName ) ) {
					continue;
				}

				const source =
					typeof asset.source === 'string'
						? asset.source
						: Buffer.from( asset.source ).toString( 'utf8' );

				const rtlSource: string = rtlcss.process( source, rtlOptions, rtlPlugins );

				const rtlFileName = fileName.replace( cssRe, '.rtl.css' );

				this.emitFile( {
					type: 'asset',
					fileName: rtlFileName,
					source: rtlSource,
				} );
			}
		},
	};
}
