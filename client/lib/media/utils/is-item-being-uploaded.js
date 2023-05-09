/**
 * Returns true if specified item is currently being uploaded (i.e. is transient).
 *
 * @param  {Object}  item Media item
 * @returns {boolean}      Whether item is being uploaded
 */
export function isItemBeingUploaded( item ) {
	if ( ! item ) {
		return null;
	}

	return !! item.transient;
}
