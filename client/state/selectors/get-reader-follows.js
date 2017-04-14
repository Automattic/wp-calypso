/**
 * External dependencies
 */
import { values } from 'lodash';

/**
 * Internal dependencies
 */

/*
 * Get all sites/feeds the user follows.
 *
 * @param  {Object}  state  Global state tree
 * @return {Integer} Follow count
 */
const getReaderFollows = state => values( state.reader.follows.items );

export default getReaderFollows;
