/** @format */

/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import './shared/public-path';
import './editor-shared/block-category'; // Register the Jetpack category
import extensionSlugsJson from './index.json';
import { isEnabled } from 'config';
import getJetpackData from './utils/get-jetpack-data';

const extensionSlugs = [
	...extensionSlugsJson.production,
	...( isEnabled( 'jetpack/blocks/beta' ) ? extensionSlugsJson.beta : [] ),
];

export function registerExtensions() {
	const extensionAvailability = get( getJetpackData(), [ 'available_blocks' ] );

	if ( ! extensionAvailability ) {
		return;
	}

	extensionSlugs.forEach( slug => require( `../../${ slug }/editor.js` ) );
}
