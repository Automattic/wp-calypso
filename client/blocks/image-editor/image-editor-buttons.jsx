/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { noop } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import {
	resetImageEditorState
} from 'state/ui/editor/image-editor/actions';
import {
	getImageEditorFileInfo,
	imageEditorHasChanges
} from 'state/ui/editor/image-editor/selectors';

class ImageEditorButtons extends Component {
	static propTypes = {
		src: PropTypes.string,
		hasChanges: PropTypes.bool,
		resetImageEditorState: PropTypes.func,
		onDone: PropTypes.func,
		onCancel: PropTypes.func
	};

	static defaultProps = {
		src: '',
		hasChanges: false,
		resetImageEditorState: noop,
		onDone: noop,
		onCancel: noop
	};

	render() {
		const {
			hasChanges,
			onCancel,
			src,
			onDone,
			translate
		} = this.props;

		return (
			<div className="editor-media-modal-image-editor__buttons">
				<Button
					className="editor-media-modal-image-editor__buttons-cancel"
					onClick={ onCancel }
				>
					{ translate( 'Cancel' ) }
				</Button>
				<Button
					disabled={ ! hasChanges }
					onClick={ this.props.resetImageEditorState }
				>
					{ translate( 'Reset' ) }
				</Button>
				<Button
					disabled={ ! src }
					primary
					onClick={ onDone }
				>
					{ translate( ' Done ' ) }
				</Button>
			</div>
		);
	}
}

export default connect(
	( state ) => {
		const { src } = getImageEditorFileInfo( state ),
			hasChanges = imageEditorHasChanges( state );

		return {
			src,
			hasChanges
		};
	},
	{
		resetImageEditorState
	}
)( localize( ImageEditorButtons ) );
