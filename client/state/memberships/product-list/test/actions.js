jest.mock( 'calypso/lib/wp', () => ( {
	__esModule: true,
	default: { req: { post: jest.fn() } },
} ) );

import wpcom from 'calypso/lib/wp';
import {
	MEMBERSHIPS_PRODUCT_DELETE_FAILURE,
	MEMBERSHIPS_PRODUCT_RECEIVE,
	MEMBERSHIPS_PRODUCT_UPDATE_FAILURE,
} from 'calypso/state/action-types';
import { requestDeleteProduct, requestUpdateProduct, requestUpdateTier } from '../actions';
import { items } from '../reducer';

const product = { ID: 1, title: 'Monthly', currency: 'USD', price: 5 };
const annualProduct = { ID: 2, title: 'Annual', tier: 1, currency: 'USD', price: 50 };
const apiProduct = { id: 1, title: 'Monthly', currency: 'USD', price: '5.00' };
const errorMessage = 'Plan is read-only';
const errorNotice = expect.objectContaining( {
	notice: expect.objectContaining( { status: 'is-error', text: errorMessage } ),
} );
const successNotice = expect.objectContaining( {
	notice: expect.objectContaining( { status: 'is-success' } ),
} );

describe( 'membership product actions', () => {
	let dispatch;
	let state;

	beforeEach( () => {
		state = { 1: [ product, annualProduct ] };
		dispatch = jest.fn( ( action ) => {
			state = items( state, action );
		} );
		wpcom.req.post.mockReset();
	} );

	describe.each( [
		[ 'HTTP 200 error body', () => Promise.resolve( { error: errorMessage } ) ],
		[
			'wrapped HTTP 200 error body',
			() => Promise.resolve( { body: { error: errorMessage }, status: 200 } ),
		],
		[
			'HTTP failure',
			() => Promise.reject( Object.assign( new Error( errorMessage ), { status: 403 } ) ),
		],
		[ 'network failure', () => Promise.reject( new Error( errorMessage ) ) ],
	] )( '%s', ( description, rejectRequest ) => {
		test( 'fails an update without changing state or showing success', async () => {
			wpcom.req.post.mockImplementation( rejectRequest );

			const result = await requestUpdateProduct( 1, product, 'Updated' )( dispatch );

			expect( result ).toBeUndefined();
			expect( dispatch ).toHaveBeenCalledWith(
				expect.objectContaining( {
					type: MEMBERSHIPS_PRODUCT_UPDATE_FAILURE,
					error: expect.objectContaining( { message: errorMessage } ),
				} )
			);
			expect( dispatch ).not.toHaveBeenCalledWith(
				expect.objectContaining( { type: MEMBERSHIPS_PRODUCT_RECEIVE } )
			);
			expect( dispatch ).toHaveBeenCalledWith( errorNotice );
			expect( dispatch ).not.toHaveBeenCalledWith( successNotice );
			expect( state[ 1 ] ).toEqual( [ product, annualProduct ] );
		} );

		test( 'restores a rejected deletion without showing success', async () => {
			wpcom.req.post.mockImplementation( rejectRequest );

			const deletion = requestDeleteProduct( 1, product, null, 'Deleted' )( dispatch );
			expect( state[ 1 ] ).toEqual( [ annualProduct ] );
			expect( await deletion ).toBeUndefined();

			expect( state[ 1 ] ).toEqual( [ product, annualProduct ] );
			expect( dispatch ).toHaveBeenCalledWith(
				expect.objectContaining( { type: MEMBERSHIPS_PRODUCT_DELETE_FAILURE, product } )
			);
			expect( dispatch ).toHaveBeenCalledWith( errorNotice );
			expect( dispatch ).not.toHaveBeenCalledWith( successNotice );
		} );

		test.each( [ product, annualProduct ] )(
			'restores only the failed product $ID of a paired deletion',
			async ( failedProduct ) => {
				wpcom.req.post.mockImplementation( ( { path } ) =>
					path.endsWith( `/${ failedProduct.ID }` ) ? rejectRequest() : Promise.resolve( {} )
				);

				await requestDeleteProduct( 1, product, annualProduct, 'Deleted' )( dispatch );

				expect( state[ 1 ] ).toEqual( [ failedProduct ] );
				expect(
					dispatch.mock.calls.filter(
						( [ action ] ) => action.type === MEMBERSHIPS_PRODUCT_DELETE_FAILURE
					)
				).toHaveLength( 1 );
				expect( dispatch ).toHaveBeenCalledWith( errorNotice );
				expect( dispatch ).not.toHaveBeenCalledWith( successNotice );
			}
		);

		test( 'stops a paired update when the monthly request fails', async () => {
			wpcom.req.post.mockImplementation( rejectRequest );

			await expect(
				requestUpdateTier( 1, product, { ...annualProduct }, 'Updated' )( dispatch )
			).resolves.toBeUndefined();

			expect( wpcom.req.post ).toHaveBeenCalledTimes( 1 );
			expect( dispatch ).toHaveBeenCalledWith( errorNotice );
			expect( dispatch ).not.toHaveBeenCalledWith( successNotice );
		} );

		test( 'does not show success when the annual update fails', async () => {
			wpcom.req.post
				.mockResolvedValueOnce( { product: apiProduct } )
				.mockImplementationOnce( rejectRequest );

			await requestUpdateTier( 1, product, { ...annualProduct }, 'Updated' )( dispatch );

			expect( wpcom.req.post ).toHaveBeenCalledTimes( 2 );
			expect( dispatch ).toHaveBeenCalledWith( errorNotice );
			expect( dispatch ).not.toHaveBeenCalledWith( successNotice );
		} );
	} );

	test.each( [ true, false, undefined ] )(
		'normalizes a successful update with is_read_only=%s',
		async ( isReadOnly ) => {
			wpcom.req.post.mockResolvedValue( { product: { ...apiProduct, is_read_only: isReadOnly } } );

			const result = await requestUpdateProduct( 1, product, 'Updated' )( dispatch );

			expect( result ).toMatchObject( { ID: 1, is_read_only: Boolean( isReadOnly ) } );
			expect( state[ 1 ][ 0 ] ).toEqual( result );
			expect( dispatch ).toHaveBeenCalledWith( successNotice );
		}
	);

	test.each( [ null, annualProduct ] )(
		'keeps successful deletion behavior with paired product %s',
		async ( pairedProduct ) => {
			wpcom.req.post.mockResolvedValue( {} );

			const result = await requestDeleteProduct(
				1,
				product,
				pairedProduct,
				'Deleted',
				true
			)( dispatch );

			expect( result ).toBe( product.ID );
			expect( state[ 1 ] ).toEqual( pairedProduct ? [] : [ annualProduct ] );
			expect( wpcom.req.post ).toHaveBeenCalledTimes( pairedProduct ? 2 : 1 );
			for ( const currentProduct of [ product, pairedProduct ].filter( Boolean ) ) {
				expect( wpcom.req.post ).toHaveBeenCalledWith(
					{
						method: 'DELETE',
						path: `/sites/1/memberships/product/${ currentProduct.ID }`,
						apiNamespace: 'wpcom/v2',
					},
					{ cancel_subscriptions: true }
				);
			}
			expect( dispatch ).toHaveBeenCalledWith( successNotice );
			expect( dispatch ).not.toHaveBeenCalledWith(
				expect.objectContaining( { type: MEMBERSHIPS_PRODUCT_DELETE_FAILURE } )
			);
		}
	);

	test( 'waits for both deletion requests and restores both failures', async () => {
		let resolveAnnual;
		wpcom.req.post.mockResolvedValueOnce( { error: errorMessage } ).mockImplementationOnce(
			() =>
				new Promise( ( resolve ) => {
					resolveAnnual = resolve;
				} )
		);

		const deletion = requestDeleteProduct( 1, product, annualProduct, 'Deleted' )( dispatch );
		await Promise.resolve();
		expect( state[ 1 ] ).toEqual( [] );
		expect( dispatch ).not.toHaveBeenCalledWith( successNotice );

		resolveAnnual( { error: errorMessage } );
		await deletion;

		expect( state[ 1 ] ).toHaveLength( 2 );
		expect( state[ 1 ] ).toEqual( expect.arrayContaining( [ product, annualProduct ] ) );
		expect(
			dispatch.mock.calls.filter( ( [ action ] ) => action.notice?.status === 'is-error' )
		).toHaveLength( 1 );
		expect( dispatch ).not.toHaveBeenCalledWith( successNotice );
	} );

	test( 'keeps successful paired updates', async () => {
		wpcom.req.post
			.mockResolvedValueOnce( { product: apiProduct } )
			.mockResolvedValueOnce( { product: { ...apiProduct, id: 2, tier: 1, price: '50.00' } } );

		await requestUpdateTier( 1, product, { ...annualProduct }, 'Updated' )( dispatch );

		expect( state[ 1 ] ).toEqual( [
			expect.objectContaining( { ID: 1, price: 5 } ),
			expect.objectContaining( { ID: 2, tier: 1, price: 50 } ),
		] );
		expect(
			dispatch.mock.calls.filter( ( [ action ] ) => action.notice?.status === 'is-success' )
		).toHaveLength( 1 );
	} );
} );
