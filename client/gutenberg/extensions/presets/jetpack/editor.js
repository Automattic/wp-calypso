/** @format */

/**
 * Internal dependencies
 */
import './shared/public-path';
import './editor-shared/block-category'; // Register the Jetpack category
import extensionSlugsJson from './index.json';
import { isEnabled } from 'config';

const extensionSlugs = [
	...extensionSlugsJson.production,
	...( isEnabled( 'jetpack/blocks/beta' ) ? extensionSlugsJson.beta : [] ),
];

export async function getExtensions() {
	const promises = extensionSlugs.map( slug =>
		// Need to explicitly look for `index.js` or Webpack will try with
		// all files when resolving the dynamic import -- including `README.md`s,
		// leading to warnings during startup.
		import( /* webpackMode: "eager" */ `../../${ slug }/index.js` ).then(
			( { childBlocks, name, settings } ) => ( {
				childBlocks,
				name,
				settings,
			} )
		)
	);

	return await Promise.all( promises );
}
