/**
 * Function returning the current Meta Boxes DOM Node in the editor
 * whether the meta box area is opened or not.
 * If the MetaBox Area is visible returns it, and returns the original container instead.
 *
 * @param   {string} location Meta Box location.
 * @return {string}          HTML content.
 */
export const getMetaBoxContainer = ( location ) => {
	const area = document.querySelector( `.edit-post-meta-boxes-area.is-${ location } .metabox-location-${ location }` );
	if ( area ) {
		return area;
	}

	return document.querySelector( '#metaboxes .metabox-location-' + location );
};
