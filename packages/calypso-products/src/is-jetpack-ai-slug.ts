import { JETPACK_AI_PRODUCTS } from './constants';

export function isJetpackAISlug( productSlug: string ): boolean {
	return ( JETPACK_AI_PRODUCTS as ReadonlyArray< string > ).includes( productSlug );
}
