import { JETPACK_SOCIAL_PRODUCTS } from './constants';

export function isJetpackSocialSlug( productSlug: string ) {
	return ( JETPACK_SOCIAL_PRODUCTS as ReadonlyArray< string > ).includes( productSlug );
}
