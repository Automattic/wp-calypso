/** @format */
/**
 * External dependencies
 */
import { find } from 'lodash';

/*
 * Find the first follow for a given feed ID
 *
 * @param  {Object}  state  Global state tree
 * @param  {Number} feedId  The feedId to find
 * @return {Object} the subscription
 */
export default ( state, feedId ) => find( state.reader.follows.items, { feed_ID: feedId } );
