/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import { noop } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';
import UploadButton from './video-editor-upload-button';

const VideoEditorControls = ( {
	isPosterUpdating,
	isVideoLoading,
	onCancel,
	onSelectFrame,
	onUploadImage,
	onUploadImageClick,
	translate,
} ) => {
	return (
		<div className="video-editor__controls">
			{ onCancel && (
				<Button
					className="video-editor__controls-button"
					disabled={ isPosterUpdating }
					onClick={ onCancel }
				>
					{ translate( 'Cancel' ) }
				</Button>
			) }
			<UploadButton
				isPosterUpdating={ isPosterUpdating }
				onClick={ onUploadImageClick }
				onUploadImage={ onUploadImage }
			>
				{ translate( 'Upload Image' ) }
			</UploadButton>
			<Button
				className="video-editor__controls-button"
				disabled={ isVideoLoading || isPosterUpdating }
				onClick={ onSelectFrame }
				primary
			>
				{ translate( 'Select Frame' ) }
			</Button>
		</div>
	);
};

VideoEditorControls.propTypes = {
	isPosterUpdating: PropTypes.bool,
	isVideoLoading: PropTypes.bool,
	onCancel: PropTypes.func,
	onSelectFrame: PropTypes.func,
	onUploadImage: PropTypes.func,
	onUploadImageClick: PropTypes.func,
};

VideoEditorControls.defaultProps = {
	isPosterUpdating: false,
	isVideoLoading: true,
	onSelectFrame: noop,
	onUploadImage: noop,
	onUploadImageClick: noop,
};

export default localize( VideoEditorControls );
