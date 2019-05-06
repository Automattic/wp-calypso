/** @format */
/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Return a collection of importer items/sessions, keyed by their IDs
 *
 * @param {Object} state  Global state tree
 * @return {Object}	importer items/sessions
 */
export default state => get( state, 'imports.items', {} );
