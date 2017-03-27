/**
 * External dependencies
 */
import { filter } from 'lodash';

/*
 * Get all sites/feeds the user follows.
 *
 * @param  {Object}  state  Global state tree
 * @return {Integer} Follow count
 */
export default function getReaderFollows( state ) {
	return filter( state.reader.follows.items, [ 'is_following', true ] );
}
