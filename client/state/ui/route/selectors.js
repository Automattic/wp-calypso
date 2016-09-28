/** @ssr-ready **/

/**
 * External dependencies
 */
import { get } from 'lodash';

export function getParam( state, param ) {
	return get( state.ui.route, [ 'params', param ], '' );
}
