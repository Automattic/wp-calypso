import {
	PRODUCT_JETPACK_BACKUP_T1_MONTHLY,
	JETPACK_BACKUP_PRODUCT_LANDING_PAGE_URL,
	JETPACK_ANTI_SPAM_PRODUCT_LANDING_PAGE_URL,
	JETPACK_SCAN_PRODUCT_LANDING_PAGE_URL,
	JETPACK_SEARCH_PRODUCT_LANDING_PAGE_URL,
	PRODUCT_JETPACK_ANTI_SPAM,
	PRODUCT_JETPACK_BOOST,
	PRODUCT_JETPACK_CRM,
	PRODUCT_JETPACK_SCAN,
	PRODUCT_JETPACK_SEARCH,
	PRODUCT_JETPACK_SOCIAL_ADVANCED,
	PRODUCT_JETPACK_VIDEOPRESS,
} from '@automattic/calypso-products';

const PRODUCT_URL_MAP: { [ key: string ]: string } = {
	[ PRODUCT_JETPACK_BACKUP_T1_MONTHLY ]: JETPACK_BACKUP_PRODUCT_LANDING_PAGE_URL,
	[ PRODUCT_JETPACK_BOOST ]: 'https://jetpack.com/boost/',
	[ PRODUCT_JETPACK_SCAN ]: JETPACK_SCAN_PRODUCT_LANDING_PAGE_URL,
	[ PRODUCT_JETPACK_SEARCH ]: JETPACK_SEARCH_PRODUCT_LANDING_PAGE_URL,
	[ PRODUCT_JETPACK_ANTI_SPAM ]: JETPACK_ANTI_SPAM_PRODUCT_LANDING_PAGE_URL,
	[ PRODUCT_JETPACK_SOCIAL_ADVANCED ]: 'https://jetpack.com/social/',
	[ PRODUCT_JETPACK_VIDEOPRESS ]: 'https://jetpack.com/features/writing/video-hosting/',
	[ PRODUCT_JETPACK_CRM ]: 'https://jetpackcrm.com/',
};

export const getProductUrl = ( productSlug: string ) => PRODUCT_URL_MAP[ productSlug ];
