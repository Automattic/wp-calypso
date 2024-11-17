import { JETPACK_SOCIAL_V1_PRODUCTS } from './constants';

export function isJetpackSocialV1Slug( productSlug: string ) {
	return ( JETPACK_SOCIAL_V1_PRODUCTS as ReadonlyArray< string > ).includes( productSlug );
}
