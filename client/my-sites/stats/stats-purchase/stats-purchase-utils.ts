export const getStatsPurchaseURL = (
	siteId: number | null,
	isOdysseyStats: boolean,
	productType = 'commercial'
) => {
	const purchasePath = `/stats/purchase/${ siteId }?productType=${ productType }&flags=stats/type-detection`;

	if ( ! isOdysseyStats ) {
		return purchasePath;
	}
	return `https://wordpress.com${ purchasePath }`;
};
