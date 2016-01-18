/**
 * External depencencies
 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { setEditorMediaEditItem } from 'state/ui/editor/media/actions';
import Dialog from 'components/dialog';

function EditorMediaAdvanced( { visible, toggleVisible } ) {
	return (
		<Dialog isVisible={ visible } onClose={ toggleVisible }>
			WIP
		</Dialog>
	);
}

EditorMediaAdvanced.propTypes = {
	visible: PropTypes.bool,
	toggleVisible: PropTypes.func
};

EditorMediaAdvanced.defaultProps = {
	visible: false,
	toggleVisible: () => {}
};

export default connect(
	( state ) => {
		return {
			item: state.ui.editor.media.editItem
		};
	},
	( dispatch ) => {
		return {
			resetEditItem: () => dispatch( setEditorMediaEditItem( null ) )
		};
	}
)( EditorMediaAdvanced );
