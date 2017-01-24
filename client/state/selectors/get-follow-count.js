/**
 * External dependencies
 */
import { size, filter } from 'lodash';

/*
 * How many sites has the user followed?
 *
 * @param  {Object}  state  Global state tree
 * @return {Integer} Follow count
 */
export default function getFollowCount( state ) {
	return size( filter( state.reader.follows.items, [ 'is_following', true ] ) );
}
