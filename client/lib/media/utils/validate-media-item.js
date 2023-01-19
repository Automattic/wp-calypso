import { ValidationErrors as MediaValidationErrors } from 'calypso/lib/media/constants';
import { isExceedingSiteMaxUploadSize } from 'calypso/lib/media/utils/is-exceeding-site-max-upload-size';
import { isSupportedFileTypeForSite } from 'calypso/lib/media/utils/is-supported-file-type-for-site';
import { isSupportedFileTypeInPremium } from 'calypso/lib/media/utils/is-supported-file-type-in-premium';

/**
 * Validates a media item for a site, and returns validation errors (if any).
 *
 * @param  {Object}      site Site object
 * @param  {Object}      item Media item
 * @returns {Array|undefined} Validation errors, or undefined if no site.
 */
export function validateMediaItem( site, item ) {
	const itemErrors = [];

	if ( ! site ) {
		return;
	}

	if ( ! isSupportedFileTypeForSite( item, site ) ) {
		if ( isSupportedFileTypeInPremium( item, site ) ) {
			itemErrors.push( MediaValidationErrors.FILE_TYPE_NOT_IN_PLAN );
		} else {
			itemErrors.push( MediaValidationErrors.FILE_TYPE_UNSUPPORTED );
		}
	}

	if ( true === isExceedingSiteMaxUploadSize( item, site ) ) {
		itemErrors.push( MediaValidationErrors.EXCEEDS_MAX_UPLOAD_SIZE );
	}

	return itemErrors;
}
