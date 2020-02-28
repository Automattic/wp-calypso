/**
 * External dependencies
 */

/**
 * Internal dependencies
 */

/**
 * WordPress dependencies
 */
/* eslint-disable import/no-extraneous-dependencies */
import { BlockPreview } from '@wordpress/block-editor';
/* eslint-enable import/no-extraneous-dependencies */

// Exists as a pass through component to simplify testing
// components which consume `BlockPreview` from
// `@wordpress/block-editor`. This is because jest cannot mock
// node modules that are not part of the root node modules.
// Due to the way this project's dependencies are defined
// `@wordpress/block-editor` does not exist within `node_modules`
// and it is there impossible to mock it without providing a wrapping
// component to act as a pass though.
// See https://jestjs.io/docs/en/manual-mocks
export default function( props ) {
	return <BlockPreview { ...props } />;
}
