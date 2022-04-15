import { wpcomRequest } from '../wpcom-request-controls';
import { requestProductsList, receiveProductsList, receiveProductsListFailure } from './actions';
import { ProductsList, ProductsListFailure } from './types';

/**
 * Requests the list of all products from the WPCOM API.
 */
export function* getProductsList() {
	yield requestProductsList();

	try {
		const productsList: ProductsList = yield wpcomRequest( {
			path: '/products',
			apiVersion: '1.1',
		} );

		// Since the request succeeded, productsList should be guaranteed non-null;
		// thus, we don't have any safety checks before this line.
		for ( const product of Object.values( productsList ) ) {
			product.cost = Number( product.cost );
		}

		yield receiveProductsList( productsList );
	} catch ( err ) {
		yield receiveProductsListFailure( err as ProductsListFailure );
	}
}
