
/**
 * Internal dependencies
 */
import { WOOCOMMERCE_WC_API_SET_UPDATE } from 'woocommerce/state/action-types';
import endpointHandlers from './endpoints/handlers';
import { setUpdate } from './updater';

export default {
	[ WOOCOMMERCE_WC_API_SET_UPDATE ]: [ handleUpdate ],
	...endpointHandlers,
};

export function handleUpdate( { dispatch }, { updateRateMilliseconds } ) {
	setUpdate( dispatch, updateRateMilliseconds );
}
