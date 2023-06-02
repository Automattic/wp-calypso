import { JETPACK_ANTI_SPAM_PRODUCTS } from './constants';

export function isJetpackAntiSpamSlug( productSlug: string ): boolean {
	return ( JETPACK_ANTI_SPAM_PRODUCTS as ReadonlyArray< string > ).includes( productSlug );
}
