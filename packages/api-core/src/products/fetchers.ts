import { wpcom } from '../wpcom-fetcher';
import { Product } from './types';

export function fetchProducts(): Promise< Record< string, Product > > {
	return wpcom.req.get( {
		path: '/products',
		apiVersion: '1.1',
	} );
}
