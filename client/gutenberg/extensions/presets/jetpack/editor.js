/**
 * External dependencies
 */
import { sprintf } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import './shared/public-path';
import './editor-shared/block-category'; // Register the Jetpack category
import extensionSlugsJson from './index.json';
import { _x } from './utils/i18n';
import { isEnabled } from 'config';

const extensionSlugs = [
	...extensionSlugsJson.production,
	...( isEnabled( 'jetpack/blocks/beta' ) ? extensionSlugsJson.beta : [] ),
];

export async function getExtensions() {
	const promises = extensionSlugs.map( slug =>
		/**
		 * Dynamically pull in extensions
		 *
		 * At build time, webpack needs to compile modules that will be dynamically imported at
		 * runtime.
		 *
		 * Because the import path is dynamic (it includes a variable), webpack does not know at
		 * build time what might be imported at runtime. Therefore, webpack will attempt to find any
		 * import that could be reached by completing the string and build the modules.
		 *
		 * By fixing parts of the path with literal strings, we can limit what webpack needs bundle
		 * here. However, any number of path parts could be inserted in the variable. Therefore, we
		 * must also include a `webpackInclude` comment to fix our string further and ensure webpack
		 * does not attempt to build problematic targets and instead only parses our
		 * intended modules.
		 */
		import( /* webpackMode: "eager" */
		/* webpackInclude: /\/gutenberg\/extensions\/[a-zA-Z0-9_-]+\/index.js$/ */
		`../../${ slug }/index.js` ).then( ( { childBlocks, name, settings } ) => ( {
			childBlocks,
			name,
			settings: extensionSlugsJson.beta.includes( slug )
				? {
						...settings,
						title: sprintf( _x( '%s (beta)', 'Gutenberg Block in beta stage' ), settings.title ),
				  }
				: settings,
		} ) )
	);

	return await Promise.all( promises );
}
