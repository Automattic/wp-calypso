/** @format */
/**
 * Internal dependencies
 */
import { registerHandlers } from 'state/data-layer/handler-loading';
import { mergeHandlers } from 'state/action-watchers/utils';
import settings from './settings';
import setup from './setup';
import debugFactory from 'debug';

const debug = debugFactory( 'wp-job-manager:errors' );

const handlers = mergeHandlers( settings, setup );

export default function installActionHandlers() {
	const added = registerHandlers( [ 'wp-job-manager', handlers ] );

	if ( ! added ) {
		debug( 'Failed to add action handlers for "wp-job-manager"' );
	}
}
