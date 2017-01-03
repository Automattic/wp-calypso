/**
 * Internal dependencies
 */
import {
	BILLING_DATA_RECEIVE,
	BILLING_DATA_REQUEST,
	BILLING_DATA_REQUEST_FAILURE,
	BILLING_DATA_REQUEST_SUCCESS
} from 'state/action-types';
import wp from 'lib/wp';
import { parseDate } from './util';

export const requestBillingData = () => {
	return ( dispatch ) => {
		dispatch( {
			type: BILLING_DATA_REQUEST,
		} );

		return wp.undocumented().me().billingHistory()
			.then( ( { billing_history, upcoming_charges } ) => {
				dispatch( {
					type: BILLING_DATA_RECEIVE,
					past: billing_history.map( parseDate ),
					upcoming: upcoming_charges.map( parseDate ),
				} );
				dispatch( {
					type: BILLING_DATA_REQUEST_SUCCESS,
				} );
			} ).catch( error => {
				dispatch( {
					type: BILLING_DATA_REQUEST_FAILURE,
					error,
				} );
			} );
	};
};
