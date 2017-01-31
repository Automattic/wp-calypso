/**
 * Internal dependencies
 */
import { isAutomatedTransferActive } from 'state/selectors/';
import {
	AUTOMATED_TRANSFER_ELIGIBILITY_REQUEST,
	AUTOMATED_TRANSFER_ELIGIBILITY_UPDATE,
	AUTOMATED_TRANSFER_STATUS_SET,
	THEME_TRANSFER_INITIATE_FAILURE,
	THEME_TRANSFER_INITIATE_PROGRESS,
	THEME_TRANSFER_INITIATE_REQUEST,
	THEME_TRANSFER_INITIATE_SUCCESS,
	THEME_TRANSFER_STATUS_FAILURE,
	THEME_TRANSFER_STATUS_RECEIVE
} from 'state/action-types';
import { getSelectedSiteId } from 'state/ui/selectors';
import config from 'config';

const WHITELIST = [
	AUTOMATED_TRANSFER_ELIGIBILITY_REQUEST,
	AUTOMATED_TRANSFER_ELIGIBILITY_UPDATE,
	AUTOMATED_TRANSFER_STATUS_SET,
	THEME_TRANSFER_INITIATE_FAILURE,
	THEME_TRANSFER_INITIATE_PROGRESS,
	THEME_TRANSFER_INITIATE_REQUEST,
	THEME_TRANSFER_INITIATE_SUCCESS,
	THEME_TRANSFER_STATUS_FAILURE,
	THEME_TRANSFER_STATUS_RECEIVE
];

/**
 * Redux store enhancer that updates dispatch to ignore actions when an
 * automated transfer is in progress.
 *
 * @param  {Function} createStore Original store creator
 * @return {Function}             Modified store creator
 */
export const automatedTransferEnhancer = createStore => ( reducer, initialState, enhancer ) => {
	const store = createStore( reducer, initialState, enhancer );
	const isDevOrWPCalypso = [ 'development', 'wpcalypso' ].indexOf( config( 'env_id' ) ) > -1;

	if ( ! ( config.isEnabled( 'automated-transfer' ) && isDevOrWPCalypso ) ) {
		return store;
	}

	const sites = require( 'lib/sites-list' )();

	return {
		...store,
		dispatch( action ) {
			const state = store.getState();
			const selectedSiteId = getSelectedSiteId( state );
			const transferActive = isAutomatedTransferActive( state, selectedSiteId );

			if ( ! transferActive || WHITELIST.indexOf( action.type ) > -1 ) {
				//dispatch normally
				store.dispatch( action );
				return action;
			}
			sites.pauseFetching();
			const noopAction = {
				type: '@@calypso/noop-transfer-in-progress',
				originalAction: action
			};
			store.dispatch( noopAction );
			return noopAction;
		}
	};
};

export default automatedTransferEnhancer;
