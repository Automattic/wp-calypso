import { BRAND_PACKS, DEFAULT_PACK_SLUG, getBrandPack } from '../brand-packs';
import type { BrandPackService } from './types';

// Default impl reads from the in-bundle brand-packs registry. A server impl
// would fetch user-authored packs from wpcom and merge them with the built-in
// list.
export const defaultBrandPackService: BrandPackService = {
	async listPacks() {
		return BRAND_PACKS.map( ( pack ) => ( { slug: pack.slug, name: pack.name } ) );
	},
	async getPack( slug: string ) {
		const pack = getBrandPack( slug );
		if ( ! pack ) {
			throw new Error( `Unknown brand pack: ${ slug }` );
		}
		return pack;
	},
	getDefaultPackSlug() {
		return DEFAULT_PACK_SLUG;
	},
};
