import {
	JETPACK_BACKUP_PRODUCTS,
	JETPACK_BOOST_PRODUCTS,
	JETPACK_SOCIAL_PRODUCTS,
	JETPACK_SEARCH_PRODUCTS,
} from '@automattic/calypso-products';
import { domainManagementEdit, domainManagementList } from 'calypso/my-sites/domains/paths';

const setWPORGPluginSlug = ( productSlugs: ReadonlyArray< string >, wporgPluginSlug: string ) => {
	return productSlugs.reduce(
		( map, productSlug ) => ( { ...map, [ productSlug ]: wporgPluginSlug } ),
		{}
	);
};

const WPORG_PLUGIN_SLUG_MAP: Record< string, string > = {
	...setWPORGPluginSlug( JETPACK_BACKUP_PRODUCTS, 'jetpack-backup' ),
	...setWPORGPluginSlug( JETPACK_BOOST_PRODUCTS, 'jetpack-boost' ),
	...setWPORGPluginSlug( JETPACK_SOCIAL_PRODUCTS, 'jetpack-social' ),
	...setWPORGPluginSlug( JETPACK_SEARCH_PRODUCTS, 'jetpack-search' ),
	// ...setWPORGPluginSlug( JETPACK_SCAN_PRODUCTS, 'jetpack-protect' ),
};

export function getWPORGPluginLink( productSlug: string ): string {
	const wporgPluginSlug = WPORG_PLUGIN_SLUG_MAP[ productSlug ];

	return wporgPluginSlug ? `https://wordpress.org/plugins/${ wporgPluginSlug }/` : '';
}

export function getDomainManagementUrl(
	{ slug }: { slug: string },
	domain: string | undefined
): string {
	return domain ? domainManagementEdit( slug, domain ) : domainManagementList( slug );
}
