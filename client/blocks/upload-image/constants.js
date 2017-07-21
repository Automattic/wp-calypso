/**
 * External dependencies
 */
import i18n from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { ValidationErrors } from 'lib/media/constants';

export const ALLOWED_FILE_EXTENSIONS = [ 'jpg', 'jpeg', 'gif', 'png', 'bmp', 'tiff', 'ico' ];

export const ERROR_UNSUPPORTED_FILE = 'ERROR_UNSUPPORTED_FILE';
export const ERROR_IMAGE_EDITOR_DONE = 'ERROR_IMAGE_EDITOR_DONE';
export const ERROR_UPLOADING_IMAGE = 'ERROR_UPLOADING_IMAGE';

export const ERROR_STRINGS = {
	[ ERROR_UNSUPPORTED_FILE ]: () =>
		i18n.translate(
			'File you are trying to upload is not supported. Please select a valid image file.',
		),

	[ ValidationErrors.SERVER_ERROR ]: () =>
		i18n.translate( 'File could not be uploaded because an error occurred while uploading.' ),
};
