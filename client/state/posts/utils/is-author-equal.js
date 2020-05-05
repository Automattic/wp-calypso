/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Returns true if the locally edited author ID is equal to the saved post author's ID. Other
 * properties of the `author` object are irrelevant.
 *
 * @param  {object}  localAuthorEdit locally edited author object
 * @param  {object}  savedAuthor     author property returned from API POST
 * @returns {boolean}                 are the locally edited and saved values equal?
 */
export function isAuthorEqual( localAuthorEdit, savedAuthor ) {
	return get( localAuthorEdit, 'ID' ) === get( savedAuthor, 'ID' );
}
