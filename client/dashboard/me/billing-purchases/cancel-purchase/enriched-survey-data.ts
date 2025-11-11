import type { MarketingSurveyResponses, Purchase } from '@automattic/api-core';

const DAY_IN_MS = 1000 * 60 * 60 * 24;

export default function enrichedSurveyData(
	surveyData: Omit< MarketingSurveyResponses, 'purchaseId' | 'purchase' >,
	purchase?: Pick< Purchase, 'subscribed_date' | 'blog_created_date' | 'ID' | 'product_slug' >,
	timestamp = new Date()
): MarketingSurveyResponses {
	const purchaseStartDate = purchase?.subscribed_date;
	const siteStartDate = purchase?.blog_created_date;
	const purchaseId = purchase?.ID ?? 0;
	const productSlug = purchase?.product_slug ?? '';

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
