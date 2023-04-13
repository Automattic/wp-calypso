import { get } from 'lodash';

/**
 * Returns true if the modified properties in the local edit of the `discussion` object (the edited
 * properties are a subset of the full object) are equal to the values in the saved post.
 *
 * @param  {Object}  localDiscussionEdits local state of discussion edits
 * @param  {Object}  savedDiscussion      discussion property returned from API POST
 * @returns {boolean}                      are there differences in local edits vs saved values?
 */
export function isDiscussionEqual( localDiscussionEdits, savedDiscussion ) {
	return Object.entries( localDiscussionEdits ).every(
		( [ key, value ] ) => get( savedDiscussion, [ key ] ) === value
	);
}
