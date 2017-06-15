/**
 * Internal dependencies
 */
import { mergeHandlers } from 'state/action-watchers/utils';
import { addHandlers } from 'state/data-layer/extensions-middleware';
import products from './products';
import request from './request';
import debugFactory from 'debug';

const debug = debugFactory( 'woocommerce:errors' );
const handlers = mergeHandlers( products, request );

export default function installActionHandlers() {
	const added = addHandlers( 'woocommerce', handlers );
	if ( ! added ) {
		debug( 'Failed to add action handlers for "woocommerce"' );
	}
}

