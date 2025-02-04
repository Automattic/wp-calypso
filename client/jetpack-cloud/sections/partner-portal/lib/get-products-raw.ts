import { APIProductFamily } from 'calypso/state/partner-portal/types';

export default function getProductsRaw( products: APIProductFamily[] ) {
	return products as any;
}
