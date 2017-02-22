/**
 * External dependencies
 */
import ReactDom from 'react-dom';
import React, { Component, PropTypes } from 'react';
import { noop } from 'lodash';
import classNames from 'classnames';

class VideoEditorUploadButton extends Component {
	static propTypes = {
		className: PropTypes.string,
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

	handleChange = ( event ) => {
		let files;

		if ( event.target.files && event.target.files.length > 0 ) {
			files = event.target.files[ 0 ];
		}

		this.props.onUploadImage( files );
		ReactDom.findDOMNode( this.form ).reset();
	}

	render() {
		const {
			children,
			className,
			isPosterUpdating,
			onClick,
		} = this.props;
		const classes = classNames(
			className,
			'video-editor__upload-button',
			{ 'is-disabled': isPosterUpdating }
		);

		return (
			<form ref={ this.setFormInstance } className={ classes }>
				<span>{ children }</span>
				<input
					accept="image/*"
					className="video-editor__upload-button-input"
					disabled={ isPosterUpdating }
					onChange={ this.handleChange }
					onClick={ onClick }
					type="file" />
			</form>
		);
	}
}

export default VideoEditorUploadButton;
