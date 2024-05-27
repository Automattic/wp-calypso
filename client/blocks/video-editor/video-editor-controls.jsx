import { Button } from '@automattic/components';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import UploadButton from './video-editor-upload-button';

const noop = () => {};

const VideoEditorControls = ( {
	isPosterUpdating = false,
	isVideoLoading = true,
	onCancel,
	onSelectFrame = noop,
	onUploadImage = noop,
	onUploadImageClick = noop,
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

export default localize( VideoEditorControls );
