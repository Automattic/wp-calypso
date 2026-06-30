const DAY_IN_MS = 1000 * 60 * 60 * 24;

export default function enrichedSurveyData( surveyData, purchase, timestamp = new Date() ) {
	const purchaseStartDate = purchase?.subscribedDate ?? null;
	const siteStartDate = purchase?.blogCreatedDate ?? null;
	const purchaseId = purchase?.id ?? null;
	const productSlug = purchase?.productSlug ?? null;

	return {
		purchase: productSlug,
		purchaseId,
		...( purchaseStartDate && {
			daysSincePurchase: ( new Date( timestamp ) - new Date( purchaseStartDate ) ) / DAY_IN_MS,
		} ),
		...( siteStartDate && {
			daysSinceSiteCreation: ( new Date( timestamp ) - new Date( siteStartDate ) ) / DAY_IN_MS,
		} ),
		...surveyData,
	};
}
