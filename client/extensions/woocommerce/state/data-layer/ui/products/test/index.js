/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { makeProductActionList, } from '../';
import { actionListStepSuccess, actionListStepFailure } from 'woocommerce/state/action-list/actions';
import { createProduct } from 'woocommerce/state/sites/products/actions';

describe( 'makeProductActionList', () => {
	it( 'should return null when there are no edits', () => {
		expect( makeProductActionList( null, 123, null ) ).to.equal.null;
	} );

	it( 'should return a single product create request', () => {
		const rootState = {
			extensions: {
				woocommerce: {
				}
			}
		};

		const product1 = { id: { index: 0 }, name: 'Product #1' };

		const edits = {
			creates: [
				product1,
			]
		};

		const action1 = createProduct(
			123,
			product1,
			actionListStepSuccess( 0 ),
			actionListStepFailure( 0, 'UNKNOWN' )
		);

		const expectedActionList = {
			steps: [
				{ description: 'Creating product: Product #1', action: action1 },
			],
			successAction: undefined,
			failureAction: undefined,
			clearUponComplete: true,
		};

		expect( makeProductActionList( rootState, 123, edits ) ).to.eql( expectedActionList );
	} );

	it( 'should return multiple product create requests', () => {
		const rootState = {
			extensions: {
				woocommerce: {
				}
			}
		};

		const product1 = { id: { index: 0 }, name: 'Product #1' };
		const product2 = { id: { index: 1 }, name: 'Product #2' };

		const edits = {
			creates: [
				product1,
				product2,
			]
		};

		const action1 = createProduct(
			123,
			product1,
			actionListStepSuccess( 0 ),
			actionListStepFailure( 0, 'UNKNOWN' )
		);

		const action2 = createProduct(
			123,
			product2,
			actionListStepSuccess( 1 ),
			actionListStepFailure( 1, 'UNKNOWN' )
		);

		const expectedActionList = {
			steps: [
				{ description: 'Creating product: Product #1', action: action1 },
				{ description: 'Creating product: Product #2', action: action2 },
			],
			successAction: undefined,
			failureAction: undefined,
			clearUponComplete: true,
		};

		expect( makeProductActionList( rootState, 123, edits ) ).to.eql( expectedActionList );
	} );

	it( 'should create an action list with success/failure actions', () => {
		const rootState = {
			extensions: {
				woocommerce: {
				}
			}
		};

		const product1 = { id: { index: 0 }, name: 'Product #1' };

		const edits = {
			creates: [
				product1,
			]
		};

		const action1 = createProduct(
			123,
			product1,
			actionListStepSuccess( 0 ),
			actionListStepFailure( 0, 'UNKNOWN' )
		);

		const successAction = { type: '%%SUCCESS%%' };
		const failureAction = { type: '%%FAILURE%%' };

		const expectedActionList = {
			steps: [
				{ description: 'Creating product: Product #1', action: action1 },
			],
			successAction,
			failureAction,
			clearUponComplete: true,
		};

		const actionList = makeProductActionList( rootState, 123, edits, successAction, failureAction );
		expect( actionList ).to.eql( expectedActionList );
	} );
} );

