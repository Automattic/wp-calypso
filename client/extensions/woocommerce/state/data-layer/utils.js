/** @format */
/**
 * External dependencies
 */
import { unescape } from 'lodash';

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

/**
 * Check that all categories in a given list are valid category objects.
 *
 * @param  {Array} categories List of categories from the remote site API
 * @return {Boolean}          True if the categories are valid.
 */
function isValidCategoriesArray( categories ) {
	for ( let i = 0; i < categories.length; i++ ) {
		if ( ! isValidProductCategory( categories[ i ] ) ) {
			// Short-circuit the loop and return now.
			return false;
		}
	}
	return true;
}

/**
 * Check if the given category has the expected properties
 *
 * @param  {Object} category A single category from the remote site API
 * @return {Boolean}         True if the category is valid.
 */
function isValidProductCategory( category ) {
	return (
		category &&
		category.id &&
		'number' === typeof category.id &&
		category.name &&
		'string' === typeof category.name &&
		category.slug &&
		'string' === typeof category.slug
	);
}

/**
 * Verify that this response has valid categories.
 *
 * If the response object has a data property, it has data from
 * the site. Otherwise it has an error message from the remote site.
 *
 * @param  {Object} response Response from an API call
 * @return {Object}          Verified response
 */
export function verifyResponseHasValidCategories( response ) {
	if ( ! response.data ) {
		throw new Error( 'Failure at remote site.', response );
	}
	const { body = [], status = 400 } = response.data;
	if ( status !== 200 || ! isValidCategoriesArray( body ) ) {
		throw new Error( 'Invalid categories.', response );
	}

	const unescapedBody = body.map( cat => {
		return {
			...cat,
			name: unescape( cat.name ),
			description: cat.description ? unescape( cat.description ) : '',
		};
	} );

	return {
		data: {
			...response.data,
			body: unescapedBody,
		},
	};
}
