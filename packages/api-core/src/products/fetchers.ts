import { wpcom } from '../wpcom-fetcher';

export function fetchProducts() {
	return wpcom.req.get( {
		path: '/products',
		apiVersion: '1.1',
	} );
}
