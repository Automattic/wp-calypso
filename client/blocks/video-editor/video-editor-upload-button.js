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
		onClick: PropTypes.func,
		onUploadImage: PropTypes.func,
	};

	static defaultProps = {
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
			onClick,
		} = this.props;
		const classes = classNames( 'video-editor__upload-button', className );

		return (
			<form ref={ this.setFormInstance } className={ classes }>
				<span>{ children }</span>
				<input
					type="file"
					accept="image/*"
					onChange={ this.handleChange }
					onClick={ onClick }
					className="video-editor__upload-button-input" />
			</form>
		);
	}
}

export default VideoEditorUploadButton;
