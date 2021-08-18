import debugFactory from 'debug';
import { mergeHandlers } from 'calypso/state/action-watchers/utils';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import feeds from './feeds';
import locks from './locks';
import zones from './zones';

const debug = debugFactory( 'zoninator:errors' );

const handlers = mergeHandlers( feeds, locks, zones );

export default function installActionHandlers() {
	const added = registerHandlers( 'zoninator', handlers );

	if ( ! added ) {
		debug( 'Failed to add action handlers for "zoninator.zones"' );
	}
}
