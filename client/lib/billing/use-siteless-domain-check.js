import { useBlogStickersQuery } from 'calypso/blocks/blog-stickers/use-blog-stickers-query';

/**
 * Hook to check if a site has stickers that indicate it is a siteless domain
 * @param {string|number} siteId - The site ID to check
 * @returns {boolean} Whether the site has siteless checkout stickers
 */
export const useSitelessDomainCheck = ( siteId ) => {
	const { data: stickersData } = useBlogStickersQuery( siteId, {
		billingContext: true,
	} );

	const stickers = Array.isArray( stickersData ) ? stickersData : stickersData?.stickers || [];
	const isSiteless = stickers.some(
		( sticker ) =>
			sticker === 'a4a-siteless-checkout-site' || sticker === 'marketplace-siteless-checkout-site'
	);

	return isSiteless;
};
