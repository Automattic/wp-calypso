/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { noop } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import UploadButton from './video-editor-upload-button';

const VideoEditorButtons = ( {
	isPosterUpdating,
	isVideoLoaded,
	onCancel,
	onSelectFrame,
	onUploadImage,
	onUploadImageClick,
	translate,
} ) => {
	return (
		<div className="video-editor__buttons">
			{ onCancel &&
				<Button
					className="video-editor__buttons-button"
					disabled={ isPosterUpdating }
					onClick={ onCancel }>
					{ translate( 'Cancel' ) }
				</Button>
			}
			<UploadButton
				className="button video-editor__buttons-button"
				isPosterUpdating={ isPosterUpdating }
				onClick={ onUploadImageClick }
				onUploadImage={ onUploadImage }>
				{ translate( 'Upload Image' ) }
			</UploadButton>
			<Button
				className="video-editor__buttons-button"
				disabled={ ! isVideoLoaded || isPosterUpdating }
				onClick={ onSelectFrame }
				primary>
				{ translate( 'Select Frame' ) }
			</Button>
		</div>
	);
};

VideoEditorButtons.propTypes = {
	isPosterUpdating: PropTypes.bool,
	isVideoLoaded: PropTypes.bool,
	onCancel: PropTypes.func,
	onSelectFrame: PropTypes.func,
	onUploadImage: PropTypes.func,
	onUploadImageClick: PropTypes.func,
};

VideoEditorButtons.defaultProps = {
	isPosterUpdating: false,
	isVideoLoaded: false,
	onSelectFrame: noop,
	onUploadImage: noop,
	onUploadImageClick: noop,
};

export default localize( VideoEditorButtons );
