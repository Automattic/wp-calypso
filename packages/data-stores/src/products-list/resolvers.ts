import wpcomRequest from 'wpcom-proxy-request';
import { RawAPIProductsList, ProductsListFailure, Dispatch } from './types';

/**
 * Requests the list of all products from the WPCOM API.
 */
export const getProductsList =
	() =>
	async ( { dispatch }: Dispatch ) => {
		dispatch.requestProductsList();

		try {
			const productsList: RawAPIProductsList = await wpcomRequest( {
				path: '/products',
				apiVersion: '1.1',
			} );

			// Since the request succeeded, productsList should be guaranteed non-null;
			// thus, we don't have any safety checks before this line.
			for ( const product of Object.values( productsList ) ) {
				product.cost = Number( product.cost );
			}

			dispatch.receiveProductsList( productsList );
		} catch ( err ) {
			dispatch.receiveProductsListFailure( err as ProductsListFailure );
		}
	};
