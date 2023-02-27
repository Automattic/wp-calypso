import { JETPACK_SOCIAL_ADVANCED_PRODUCTS } from './constants';

export function isJetpackSocialAdvancedSlug( productSlug: string ) {
	return ( JETPACK_SOCIAL_ADVANCED_PRODUCTS as ReadonlyArray< string > ).includes( productSlug );
}
