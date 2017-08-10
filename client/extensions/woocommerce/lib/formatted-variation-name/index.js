/** @format */
/**
 * Returns a formatted variation name for display based on attributes.
 *
 * @param {Object} variation Variation object.
 * @param {String} fallbackName Fallback name to use if no attributes are passed.
 * @return {String} Formatted variation name.
 */
export default function formattedVariationName( { attributes }, fallbackName = '' ) {
	return (
		( Array.isArray( attributes ) &&
			attributes
				.map( function( attribute ) {
					return attribute.option;
				} )
				.join( ' - ' ) ) ||
		fallbackName
	);
}
