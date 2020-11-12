/**
 * Internal dependencies
 */
import useBlockSync from './use-block-sync';

function BlockEditorProvider( props ) {
	const { children } = props;

	// Syncs the entity provider with changes in the block-editor store.
	useBlockSync( props );

	return children;
}

export default BlockEditorProvider;
