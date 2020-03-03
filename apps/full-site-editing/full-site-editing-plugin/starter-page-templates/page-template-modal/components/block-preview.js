/**
 * External dependencies
 */

/**
 * Internal dependencies
 */

/**
 * WordPress dependencies
 */
import { BlockEditorProvider, BlockList } from '@wordpress/block-editor';
import { Disabled } from '@wordpress/components';

// Exists as a pass through component to simplify automatted testing of
// components which need to `BlockEditorProvider`. Setting up JSDom to handle
// and mock the entire Block Editor isn't useful and is difficult for testing.
// Therefore this component exists to simplify mocking out the Block Editor
// when under test conditions.
export default function( { blocks, settings, recomputeBlockListKey } ) {
	return (
		<BlockEditorProvider value={ blocks } settings={ settings }>
			<Disabled key={ recomputeBlockListKey }>
				<BlockList />
			</Disabled>
		</BlockEditorProvider>
	);
}
