import { wpcom } from '../wpcom-fetcher';
import type { Product } from './types';

export async function fetchProducts(): Promise< Record< string, Product > > {
	return await wpcom.req.get( {
		path: '/products?type=all',
		apiVersion: '1.1',
	} );
}
