/**
 * External dependencies
 */
import { assert } from 'chai';
import Dispatcher from 'dispatcher';
import defer from 'lodash/function/defer';
import find from 'lodash/collection/find';

/**
 * Internal dependencies
 */
import { action as actionTypes } from 'lib/upgrades/constants';
import PurchasesStore from '../store';

describe( 'Purchases Store', () => {
	it( 'should store purchases from the site/user actions', done => {
		Dispatcher.handleServerAction( {
			type: actionTypes.PURCHASES_USER_FETCH_COMPLETED,
			purchases: [ { id: 1 }, { id: 2 } ]
		} );

		defer( () => {
			Dispatcher.handleServerAction( {
				type: actionTypes.PURCHASES_SITE_FETCH_COMPLETED,
				purchases: [ { id: 2 }, { id: 3 } ]
			} );

			assert( find( PurchasesStore.get().data, { id: 1 } ) );
			assert( find( PurchasesStore.get().data, { id: 2 } ) );
			assert( find( PurchasesStore.get().data, { id: 3 } ) );

			done();
		} );
	} );
} );
