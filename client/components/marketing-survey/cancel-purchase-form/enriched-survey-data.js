/**
 * External dependencies
 */
import { get } from 'lodash';

const DAY_IN_MS = 1000 * 60 * 60 * 24;

export default function enrichedSurveyData( surveyData, site, purchase, timestamp = new Date() ) {
	const purchaseStartDate = get( purchase, 'subscribedDate', null );
	const siteStartDate = get( site, 'options.created_at', null );
	const purchaseId = get( purchase, 'id', null );
	const productSlug = get( purchase, 'productSlug', null );

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
