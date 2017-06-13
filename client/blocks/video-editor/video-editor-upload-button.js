/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import FilePicker from 'components/file-picker';

class VideoEditorUploadButton extends Component {
	static propTypes = {
		isPosterUpdating: PropTypes.bool,
		onClick: PropTypes.func,
		onUploadImage: PropTypes.func,
	};

	static defaultProps = {
		isPosterUpdating: false,
		onClick: noop,
		onUploadImage: noop,
	};

	setFormInstance = ref => this.form = ref;

	uploadImage = files => {
		const file = files[ 0 ];

		if ( file ) {
			this.props.onUploadImage( file );
		}
	}

	render() {
		const {
			children,
			isPosterUpdating,
			onClick,
		} = this.props;

		return (
			<form className="video-editor__upload-form">
				<FilePicker
					accept="image/*"
					onPick={ this.uploadImage }>
					<Button
						className="video-editor__controls-button"
						disabled={ isPosterUpdating }
						onClick={ onClick }>
						{ children }
					</Button>
				</FilePicker>
			</form>
		);
	}
}

export default VideoEditorUploadButton;
