/**
 * Internal dependencies
 */
import { fetchOrderTransaction, onSuccess, onError } from '../';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import {
	setOrderTransaction,
	setOrderTransactionError,
} from 'calypso/state/order-transactions/actions';

describe( 'wpcom-api', () => {
	describe( 'me/transactions/order', () => {
		const orderId = 123;

		describe( 'fetchOrderTransaction()', () => {
			test( 'should return the expected http request action.', () => {
				const action = {
					orderId,
				};

				expect( fetchOrderTransaction( action ) ).toEqual(
					http(
						{
							path: `/me/transactions/order/${ action.orderId }`,
							method: 'GET',
							apiNamespace: 'rest/v1',
							query: {
								http_envelope: 1,
							},
						},
						action
					)
				);
			} );
		} );

		describe( 'onSuccess()', () => {
			test( 'should return the expected setting action for populating state.', () => {
				const action = {
					orderId,
				};
				const detail = {
					status: 'profit!',
				};

				expect( onSuccess( action, detail ) ).toEqual(
					setOrderTransaction( action.orderId, detail )
				);
			} );
		} );

		describe( 'onError()', () => {
			test( 'should return the expected error notice action.', () => {
				const error = {
					message: 'something goes wrong!',
				};
				expect( onError( { orderId }, error ) ).toEqual(
					setOrderTransactionError( orderId, error )
				);
			} );
		} );
	} );
} );
