/**
 * External depencencies
 */
import React, { PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { toggleEditorMediaAdvanced } from 'state/ui/editor/media/actions';
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
			visible: state.ui.editor.media.advanced
		};
	},
	( dispatch ) => {
		return bindActionCreators( {
			toggleVisible: toggleEditorMediaAdvanced
		}, dispatch );
	}
)( EditorMediaAdvanced );
