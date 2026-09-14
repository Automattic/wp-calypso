const DAY_IN_MS = 1000 * 60 * 60 * 24;

type EnrichablePurchase = {
	subscribedDate?: string | null;
	blogCreatedDate?: string | null;
	id?: string | number | null;
	productSlug?: string | null;
};

export default function enrichedSurveyData(
	surveyData: Record< string, unknown >,
	purchase?: EnrichablePurchase | null,
	timestamp: string | number | Date = new Date()
) {
	const purchaseStartDate = purchase?.subscribedDate ?? null;
	const siteStartDate = purchase?.blogCreatedDate ?? null;
	const purchaseId = purchase?.id ?? null;
	const productSlug = purchase?.productSlug ?? null;

	return {
		purchase: productSlug,
		purchaseId,
		...( purchaseStartDate && {
			daysSincePurchase:
				( new Date( timestamp ).getTime() - new Date( purchaseStartDate ).getTime() ) / DAY_IN_MS,
		} ),
		...( siteStartDate && {
			daysSinceSiteCreation:
				( new Date( timestamp ).getTime() - new Date( siteStartDate ).getTime() ) / DAY_IN_MS,
		} ),
		...surveyData,
	};
}
