const REGEXP_VIDEOPRESS_GUID = /^[a-z\d]+$/i;

/**
 * Returns true if the provided media object is a VideoPress video item.
 *
 * @param  {Object}  item Media object
 * @returns {boolean}      Whether the media is a VideoPress video item
 */
export function isVideoPressItem( item ) {
	if ( ! item || ! item.videopress_guid ) {
		return false;
	}

	return REGEXP_VIDEOPRESS_GUID.test( item.videopress_guid );
}
