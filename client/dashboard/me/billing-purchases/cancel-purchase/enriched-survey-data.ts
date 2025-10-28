import type { MarketingSurveyResponses, Purchase } from '@automattic/api-core';

const DAY_IN_MS = 1000 * 60 * 60 * 24;

export default function enrichedSurveyData(
	surveyData: Omit< MarketingSurveyResponses, 'purchaseId' | 'purchase' >,
	purchase: Purchase,
	timestamp = new Date()
): MarketingSurveyResponses {
	const purchaseStartDate = purchase?.subscribed_date ?? null;
	const siteStartDate = purchase?.blog_created_date ?? null;
	const purchaseId = purchase?.ID ?? null;
	const productSlug = purchase?.product_slug ?? null;

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
