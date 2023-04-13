import { JETPACK_SOCIAL_BASIC_PRODUCTS } from './constants';

export function isJetpackSocialBasicSlug( productSlug: string ) {
	return ( JETPACK_SOCIAL_BASIC_PRODUCTS as ReadonlyArray< string > ).includes( productSlug );
}
