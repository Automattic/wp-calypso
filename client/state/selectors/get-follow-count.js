/**
 * External dependencies
 */
import { size, find, matchesProperty } from 'lodash';

/*
 * How many sites has the user followed?
 *
 * @param  {Object}  state  Global state tree
 * @return {Integer} Follow count
 */
export default function getFollowCount( state ) {
	return size( find( state.reader.follows.items, matchesProperty( 'is_following', true ) ) );
}
