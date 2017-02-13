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
import UploadButton from './video-editor-upload-button';

class VideoEditorButtons extends Component {
	static propTypes = {
		onCancel: PropTypes.func,
		onSelectFrame: PropTypes.func,
		onUploadImage: PropTypes.func,
	};

	static defaultProps = {
		onSelectFrame: noop,
		onUploadImage: noop,
	};

	render() {
		const {
			onCancel,
			onSelectFrame,
			onUploadImage,
			translate,
		} = this.props;

		return (
			<div className="video-editor__buttons">
				{ onCancel &&
					<Button
						className="video-editor__buttons-button"
						onClick={ onCancel }
					>
						{ translate( 'Cancel' ) }
					</Button>
				}
				<UploadButton
					className="button video-editor__buttons-button"
					onUploadImage={ onUploadImage }>
					{ translate( 'Upload Image' ) }
				</UploadButton>
				<Button
					className="video-editor__buttons-button"
					primary
					onClick={ onSelectFrame }
				>
					{ translate( 'Select Frame' ) }
				</Button>
			</div>
		);
	}
}

export default connect()( localize( VideoEditorButtons ) );
