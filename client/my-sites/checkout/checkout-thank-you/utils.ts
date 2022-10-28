import {
	JETPACK_BACKUP_PRODUCTS,
	JETPACK_BOOST_PRODUCTS,
	JETPACK_SOCIAL_PRODUCTS,
	JETPACK_SEARCH_PRODUCTS,
	JETPACK_VIDEOPRESS_PRODUCTS,
} from '@automattic/calypso-products';
import JetpackBackupPluginImage from 'calypso/assets/images/jetpack/jetpack-plugin-image-backup.svg';
import JetpackBoostPluginImage from 'calypso/assets/images/jetpack/jetpack-plugin-image-boost.svg';
import JetpackSearchPluginImage from 'calypso/assets/images/jetpack/jetpack-plugin-image-search.svg';
import JetpackSocialPluginImage from 'calypso/assets/images/jetpack/jetpack-plugin-image-social.svg';
import JetpackPluginImage from 'calypso/assets/images/jetpack/licensing-activation-plugin-install.svg';
import { domainManagementEdit, domainManagementList } from 'calypso/my-sites/domains/paths';

const buildKeyValuePairByProductSlugs = (
	productSlugs: ReadonlyArray< string >,
	value: string
) => {
	return productSlugs.reduce( ( map, productSlug ) => ( { ...map, [ productSlug ]: value } ), {} );
};

const WPORG_PLUGIN_SLUG_MAP: Record< string, string > = {
	...buildKeyValuePairByProductSlugs( JETPACK_BACKUP_PRODUCTS, 'jetpack-backup' ),
	...buildKeyValuePairByProductSlugs( JETPACK_BOOST_PRODUCTS, 'jetpack-boost' ),
	...buildKeyValuePairByProductSlugs( JETPACK_SOCIAL_PRODUCTS, 'jetpack-social' ),
	...buildKeyValuePairByProductSlugs( JETPACK_SEARCH_PRODUCTS, 'jetpack-search' ),
	...buildKeyValuePairByProductSlugs( JETPACK_VIDEOPRESS_PRODUCTS, 'jetpack-videopress' ),
};

const JETPACK_PLUGIN_IMAGE_MAP: Record< string, string > = {
	...buildKeyValuePairByProductSlugs( JETPACK_BACKUP_PRODUCTS, JetpackBackupPluginImage ),
	...buildKeyValuePairByProductSlugs( JETPACK_BOOST_PRODUCTS, JetpackBoostPluginImage ),
	...buildKeyValuePairByProductSlugs( JETPACK_SOCIAL_PRODUCTS, JetpackSocialPluginImage ),
	...buildKeyValuePairByProductSlugs( JETPACK_SEARCH_PRODUCTS, JetpackSearchPluginImage ),
};

const JETPACK_SUPPORT_DOCS_MAP: Record< string, string > = {
	...buildKeyValuePairByProductSlugs(
		JETPACK_BACKUP_PRODUCTS,
		'backup/the-jetpack-backup-plugin/getting-started-with-the-jetpack-backup-plugin/#installing-jetpack-backup'
	),
	...buildKeyValuePairByProductSlugs(
		JETPACK_BOOST_PRODUCTS,
		'performance/jetpack-boost/#how-to-install-jetpack-boost'
	),
	...buildKeyValuePairByProductSlugs(
		JETPACK_SOCIAL_PRODUCTS,
		'social/jetpack-social-plugin/#installing-jetpack-social'
	),
	...buildKeyValuePairByProductSlugs(
		JETPACK_SEARCH_PRODUCTS,
		'search/jetpack-search-plugin/#installing-jetpack-search-plugin'
	),
};

export function getWPORGPluginLink( productSlug: string ): string {
	const wporgPluginSlug = WPORG_PLUGIN_SLUG_MAP[ productSlug ];

	return wporgPluginSlug ? `https://wordpress.org/plugins/${ wporgPluginSlug }/` : '';
}

export function getJetpackPluginSupportDocLink( productSlug: string ): string {
	const supportDoc = JETPACK_SUPPORT_DOCS_MAP[ productSlug ];
	const DEFAULT_SUPPORT_DOC_LINK =
		'https://jetpack.com/support/install-jetpack-and-connect-your-new-plan/';

	return supportDoc ? `https://jetpack.com/support/${ supportDoc }` : DEFAULT_SUPPORT_DOC_LINK;
}

export function getJetpackPluginImage( productSlug: string ): string {
	return JETPACK_PLUGIN_IMAGE_MAP[ productSlug ] ?? JetpackPluginImage;
}

export function getDomainManagementUrl(
	{ slug }: { slug: string },
	domain: string | undefined
): string {
	return domain ? domainManagementEdit( slug, domain ) : domainManagementList( slug );
}
