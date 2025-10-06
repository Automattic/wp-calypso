export default {
	/**
	 * Given a media filter, returns a partial mime type that can be used to
	 * find only media of a certain type. Returns a blank mime if no filter,
	 * or an unrecognized filter, is provided.
	 * @param {string} filter - The filter to get a mime from
	 * @returns {string} Mime type
	 */
	getMimeBaseTypeFromFilter: function ( filter ) {
		let mime;

		switch ( filter ) {
			case 'images':
				mime = 'image/';
				break;
			case 'audio':
				mime = 'audio/';
				break;
			case 'videos':
				mime = 'video/';
				break;
			case 'documents':
				// All document formats allowed by WordPress are prefixed by
				// application/. Despite its name, no other type allowed by WP
				// is using the prefix so this is easier then listing all doc
				// types separately.
				mime = 'application/';
				break;
			default:
				mime = '';
				break;
		}

		return mime;
	},

	/**
	 * Return a file type filter suitable for Google Photos
	 * @param {string} wpMimeFilter Calypso MIME filter
	 * @returns {string} Converted MIME filter, or null if unsupported type
	 */
	convertMimeFilter( wpMimeFilter ) {
		if ( wpMimeFilter === 'videos' ) {
			return 'video';
		} else if ( wpMimeFilter === 'images' ) {
			return 'photo';
		}

		return null;
	},
};
