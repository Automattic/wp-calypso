/*
 * External dependencies
 */
import filter from 'lodash/filter';
import includes from 'lodash/includes';
import sortBy from 'lodash/sortBy';
import find from 'lodash/find';

/**
 * Internal dependencies
 */
import createSelector from 'lib/create-selector';
import { slugify } from './actions';

/**
 * Returns true if currently requesting a Reader tag, or
 * false otherwise.
 *
 * @param  {Object}  state  Global state tree
 * @return {Boolean}        Whether a tag is being requested
 */
export function isRequestingTag( state ) {
	return !! state.reader.tags.isRequestingTag;
}

/**
 * Returns true if currently requesting Reader tags, or
 * false otherwise.
 *
 * @param  {Object}  state  Global state tree
 * @return {Boolean}        Whether tags are being requested
 */
export function isRequestingSubscribedTags( state ) {
	return !! state.reader.tags.isRequestingTags;
}

/**
 * Returns the user's subscribed Reader tags.
 *
 * @param  {Object}  state  Global state tree
 * @return {?Object}        Reader tags
 */
export const getSubscribedTags = createSelector(
	( state ) => sortBy(
		filter( state.reader.tags.items, ( item ) => {
			// Is the user subscribed to this tag?
			return includes( state.reader.tags.subscribedTags, item.ID );
		} ), 'slug' ),
	( state ) => [ state.reader.tags.items, state.reader.tags.subscribedTags ]
);

/**
 * Returns information about a single Reader tag.
 *
 * @param  {Object}  state  Global state tree
 * @param  {String}  name   Tag name
 * @return {?Object}        Reader tag
 */
export function getTagByName( state, name ) {
	if ( ! name ) return;
	const slug = slugify(name);
	return find( state.reader.tags.items, ( tag ) => tag.slug === slug );
}
