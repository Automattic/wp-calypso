/**
 * Internal dependencies
 */
import { addHandlers } from 'state/data-layer/extensions-middleware';
import feeds from './feeds';
import zones from './zones';
import debugFactory from 'debug';

const debug = debugFactory( 'zoninator:errors' );

export default function installActionHandlers() {
	if ( ! addHandlers( 'zoninator.zones', zones ) ) {
		debug( 'Failed to add action handlers for "zoninator.zones"' );
	}

	if ( ! addHandlers( 'zoninator.feeds', feeds ) ) {
		debug( 'Failed to add action handlers for "zoninator.feeds"' );
	}
}
