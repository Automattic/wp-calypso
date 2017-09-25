/**
 * External dependencies
 */
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import settings from './settings';
import setup from './setup';
import { mergeHandlers } from 'state/action-watchers/utils';
import { addHandlers } from 'state/data-layer/extensions-middleware';

const debug = debugFactory( 'wp-job-manager:errors' );

const handlers = mergeHandlers(
	settings,
	setup,
);

export default function installActionHandlers() {
	const added = addHandlers( 'wp-job-manager', handlers );

	if ( ! added ) {
		debug( 'Failed to add action handlers for "wp-job-manager"' );
	}
}
