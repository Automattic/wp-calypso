/**
 * External dependencies
 */
import { find } from 'lodash';

/**
 * Internal dependencies
 */
import 'calypso/state/reader/init';

/*
 * Find the first follow for a given feed ID
 *
 * @param  {object}  state  Global state tree
 * @param  {number} feedId  The feedId to find
 * @returns {object} the subscription
 */
export default ( state, feedId ) => find( state.reader.follows.items, { feed_ID: feedId } );
