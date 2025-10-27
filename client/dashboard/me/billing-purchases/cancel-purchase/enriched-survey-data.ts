import type { Purchase } from '@automattic/api-core';

const DAY_IN_MS = 1000 * 60 * 60 * 24;

//used
export default function enrichedSurveyData(
	surveyData: object,
	purchase: Purchase,
	timestamp = new Date()
) {
	const purchaseStartDate = purchase?.subscribed_date ?? null;
	const siteStartDate = purchase?.blog_created_date ?? null;
	const purchaseId = purchase?.ID ?? null;
	const productSlug = purchase?.product_slug ?? null;

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
