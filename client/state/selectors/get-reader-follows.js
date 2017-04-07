/**
 * External dependencies
 */
import { values } from 'lodash';

/*
 * Get all sites/feeds the user follows.
 * Includes those that are no longer followed but in the state tree (unfollowed this session)
 *
 * @param  {Object}  state  Global state tree
 * @return {Integer} followed sites/feeds
 */
const getReaderFollows = state => values( state.reader.follows.items );

export default getReaderFollows;
