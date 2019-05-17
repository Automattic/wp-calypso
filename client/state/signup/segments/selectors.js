/** @format */

/**
 * External dependencies
 */
import { find, get } from 'lodash';

/**
 * Internal dependencies
 */
import createSelector from 'lib/create-selector';
import { getAllSegmentDefinitions } from 'lib/signup/segments';

const siteSegmentDefinitions = getAllSegmentDefinitions();

/**
 * Returns augmented segments collection from state tree
 *
 * @param  {Object} state               Global state tree
 * @param  {Object} segmentDefinitions  Segment definitions with which we'll augment the collection we receive from the API
 * @return {Array?}     		        The segment collection
 */
export const getSegments = ( state, segmentDefinitions = siteSegmentDefinitions ) => {
	const segments = get( state, [ 'signup', 'segments' ], [] );

	return segments.length
		? segments.map( item => ( {
				...item,
				...get( segmentDefinitions, item.slug, {} ),
		  } ) )
		: null;
};

/**
 * Looks up the segments collection by slug name and returns the found object
 *
 * @param  {Object} state       Global state tree
 * @param  {String} slug        The segment slug, e.g., `'business'`
 * @return {Object}     		The segment object
 */
export const getSegmentBySlug = createSelector(
	( state, slug ) => find( getSegments( state ), [ 'slug', slug ] ) || {},
	[ getSegments ]
);

/**
 * Looks up the segments collection by segment id and returns the found object
 *
 * @param  {Object} state       Global state tree
 * @param  {Number} id          The segment id, e.g., `1`
 * @return {Object}     		The segment object
 */
export const getSegmentById = createSelector(
	( state, id ) => find( getSegments( state ), [ 'id', id ] ) || {},
	[ getSegments ]
);
