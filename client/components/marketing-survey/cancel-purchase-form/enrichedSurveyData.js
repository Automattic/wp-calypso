/**
 * External dependencies
 */
import { get } from 'lodash';

export default function enrichedSurveyData( surveyData, moment, site, purchase ) {
	const purchaseStartDate = get( purchase, 'subscribedDate', null );
	const siteStartDate = get( site, 'options.created_at', null );
	const purchaseId = get( purchase, 'id', null );
	const productSlug = get( purchase, 'productSlug', null );

	return Object.assign(
		{
			purchase: productSlug,
			purchaseId,
		},
		purchaseStartDate && {
			daysSincePurchase: moment.diff( purchaseStartDate, 'days', true ),
		},
		siteStartDate && {
			daysSinceSiteCreation: moment.diff( siteStartDate, 'days', true ),
		},
		surveyData,
	);
}
