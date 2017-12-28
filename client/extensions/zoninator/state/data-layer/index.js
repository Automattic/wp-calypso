/** @format */

/**
 * Internal dependencies
 */

import { mergeHandlers } from 'client/state/action-watchers/utils';
import { addHandlers } from 'client/state/data-layer/extensions-middleware';
import feeds from './feeds';
import zones from './zones';
import debugFactory from 'debug';

const debug = debugFactory( 'zoninator:errors' );

const handlers = mergeHandlers( feeds, zones );

export default function installActionHandlers() {
	const added = addHandlers( 'zoninator', handlers );

	if ( ! added ) {
		debug( 'Failed to add action handlers for "zoninator.zones"' );
	}
}
