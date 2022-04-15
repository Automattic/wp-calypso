import { wpcomRequest } from '../wpcom-request-controls';
import { requestProductsList, receiveProductsList, receiveProductsListFailure } from './actions';
import { ensureNumericCost } from './assembler';
import { ProductsList, ProductsListFailure } from './types';

/**
 * Requests the list of all products from the WPCOM API.
 *
 * @param   {string} type The type of products to request (e.g., "jetpack");
 */
export function* getProductsList( type: string | null ) {
	yield requestProductsList();

	try {
		const productsList: ProductsList = yield wpcomRequest( {
			path: '/products',
			apiVersion: '1.1',
		} );

		// Since the request succeeded, productsList should be guaranteed non-null;
		// thus, we don't have any safety checks before this line.

		// Create a completely new products list to avoid mutating the original
		const sanitizedProductsList = Object.fromEntries(
			Object.entries( productsList ).map( ( [ slug, product ] ) => [
				slug,
				ensureNumericCost( product ),
			] )
		);

		yield receiveProductsList( sanitizedProductsList, type );
	} catch ( err ) {
		yield receiveProductsListFailure( err as ProductsListFailure );
	}
}
