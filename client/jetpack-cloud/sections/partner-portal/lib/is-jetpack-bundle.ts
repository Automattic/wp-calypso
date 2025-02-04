import { APIProductFamilyProduct } from 'calypso/state/partner-portal/types';

const JETPACK_BUNDLES = [
	'jetpack-complete',
	'jetpack-security-t1',
	'jetpack-security-t2',
	'jetpack-starter',
	'jetpack-growth',
];

export default function isJetpackBundle( product: APIProductFamilyProduct | string ) {
	if ( typeof product === 'string' ) {
		return JETPACK_BUNDLES.includes( product );
	}
	return product.family_slug === 'jetpack-packs';
}
