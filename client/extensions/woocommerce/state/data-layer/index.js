/**
 * Internal dependencies
 */

import { mergeHandlers } from 'calypso/state/action-watchers/utils';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import actionList from './action-list';
import currencies from './data/currencies';
import locations from './data/locations';
import counts from './data/counts';
import request from './request';
import settingsGeneral from '../sites/settings/general/handlers';
import debugFactory from 'debug';

const debug = debugFactory( 'woocommerce:errors' );

const handlers = mergeHandlers(
	actionList,
	counts,
	currencies,
	locations,
	request,
	settingsGeneral
);

export default function installActionHandlers() {
	const added = registerHandlers( 'woocommerce', handlers );
	if ( ! added ) {
		debug( 'Failed to add action handlers for "woocommerce"' );
	}
}
