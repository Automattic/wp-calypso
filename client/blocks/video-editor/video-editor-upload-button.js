/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';

class VideoEditorUploadButton extends Component {
	static propTypes = {
		className: PropTypes.string,
	};

	setFormInstance = ref => this.form = ref;

	render() {
		const {
			children,
			className,
		} = this.props;
		const classes = classNames( 'video-editor__upload-button', className );

		return (
			<form ref={ this.setFormInstance } className={ classes }>
				<span>{ children }</span>
				<input
					type="file"
					accept="image/*"
					className="video-editor__upload-button-input" />
			</form>
		);
	}
}

export default VideoEditorUploadButton;
