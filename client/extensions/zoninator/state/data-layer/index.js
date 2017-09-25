/**
 * External dependencies
 */
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import feeds from './feeds';
import zones from './zones';
import { mergeHandlers } from 'state/action-watchers/utils';
import { addHandlers } from 'state/data-layer/extensions-middleware';

const debug = debugFactory( 'zoninator:errors' );

const handlers = mergeHandlers(
	feeds,
	zones,
);

export default function installActionHandlers() {
	const added = addHandlers( 'zoninator', handlers );

	if ( ! added ) {
		debug( 'Failed to add action handlers for "zoninator.zones"' );
	}
}
