/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import noop from 'lodash/noop';

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

const MediaModalImageEditorButtons = React.createClass( {
	displayName: 'MediaModalImageEditorButtons',

	propTypes: {
		src: React.PropTypes.string,
		hasChanges: React.PropTypes.bool,
		resetImageEditorState: React.PropTypes.func,
		onDone: React.PropTypes.func,
		onCancel: React.PropTypes.func
	},

	getDefaultProps() {
		return {
			src: '',
			hasChanges: false,
			resetImageEditorState: noop,
			onDone: noop,
			onCancel: noop
		};
	},

	render() {
		return (
			<div className="editor-media-modal-image-editor__buttons">
				<Button
					className="editor-media-modal-image-editor__buttons-cancel"
					onClick={ this.props.onCancel }>
					{ this.translate( 'Cancel' ) }
				</Button>
				<Button
					disabled={ ! this.props.hasChanges }
					onClick={ this.props.resetImageEditorState } >
					{ this.translate( 'Reset' ) }
				</Button>
				<Button
					disabled={ ! this.props.src }
					primary
					onClick={ this.props.onDone } >
					{ this.translate( ' Done ' ) }
				</Button>
			</div>
		);
	}
} );

export default connect(
	( state ) => {
		const { src } = getImageEditorFileInfo( state ),
			hasChanges = imageEditorHasChanges( state );

		return {
			src,
			hasChanges
		};
	},
	{ resetImageEditorState }
)( MediaModalImageEditorButtons );
