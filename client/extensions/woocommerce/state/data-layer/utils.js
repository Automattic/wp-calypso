/**
 * Verify that this response has data (is not an error).
 *
 * If the response object has a data property, it has data from
 * the site. Otherwise it has an error message from the remote site.
 *
 * @param  {Object} response Response from an API call
 * @return {Object}          Verified response
 */
export function verifyResponseHasData( response ) {
	if ( ! response.data ) {
		throw new Error( 'Failure at remote site.', response );
	}
	return response;
}
