/** @format */

/**
 * Internal dependencies
 */

import { mergeHandlers } from 'state/action-watchers/utils';
import { addHandlers } from 'state/data-layer/extensions-middleware';
import feeds from './feeds';
import locks from './locks';
import zones from './zones';
import debugFactory from 'debug';

const debug = debugFactory( 'zoninator:errors' );

const handlers = mergeHandlers( feeds, locks, zones );

export default function installActionHandlers() {
	const added = addHandlers( 'zoninator', handlers );

	if ( ! added ) {
		debug( 'Failed to add action handlers for "zoninator.zones"' );
	}
}
