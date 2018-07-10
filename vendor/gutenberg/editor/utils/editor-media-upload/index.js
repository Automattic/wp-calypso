/**
 * External dependencies
 */
import { noop } from 'lodash';

/**
 * WordPress dependencies
 */
import { select } from '@wordpress/data';
import { mediaUpload } from '@wordpress/utils';

/**
 * Upload a media file when the file upload button is activated.
 * Wrapper around mediaUpload() that injects the current post ID.
 *
 * @param   {Object}   $0                   Parameters object passed to the function.
 * @param   {string}   $0.allowedType       The type of media that can be uploaded, or '*' to allow all.
 * @param   {?Object}  $0.additionalData    Additional data to include in the request.
 * @param   {Array}    $0.filesList         List of files.
 * @param   {?number}  $0.maxUploadFileSize Maximum upload size in bytes allowed for the site.
 * @param   {Function} $0.onError           Function called when an error happens.
 * @param   {Function} $0.onFileChange      Function called each time a file or a temporary representation of the file is available.
 */
export default function editorMediaUpload( {
	allowedType,
	filesList,
	maxUploadFileSize,
	onError = noop,
	onFileChange,
} ) {
	const postId = select( 'core/editor' ).getCurrentPostId();

	mediaUpload( {
		allowedType,
		filesList,
		onFileChange,
		additionalData: {
			post: postId,
		},
		maxUploadFileSize,
		onError: ( { message } ) => onError( message ),
	} );
}
