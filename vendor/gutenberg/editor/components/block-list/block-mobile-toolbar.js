/**
 * WordPress dependencies
 */
import { ifViewportMatches } from '@wordpress/viewport';

/**
 * Internal dependencies
 */
import BlockMover from '../block-mover';
import BlockSettingsMenu from '../block-settings-menu';
import VisualEditorInserter from '../inserter';

function BlockMobileToolbar( { rootUID, uid } ) {
	return (
		<div className="editor-block-list__block-mobile-toolbar">
			<VisualEditorInserter />
			<BlockMover uids={ [ uid ] } />
			<BlockSettingsMenu rootUID={ rootUID } uids={ [ uid ] } />
		</div>
	);
}

export default ifViewportMatches( '< small' )( BlockMobileToolbar );
