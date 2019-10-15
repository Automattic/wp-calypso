/**
 * External dependencies
 */
import { get } from 'lodash';
import moment from 'moment';

export default function enrichedSurveyData( surveyData, timestamp, site, purchase ) {
	const purchaseStartDate = get( purchase, 'subscribedDate', null );
	const siteStartDate = get( site, 'options.created_at', null );
	const purchaseId = get( purchase, 'id', null );
	const productSlug = get( purchase, 'productSlug', null );

	// Use current time if no timestamp is provided.
	if ( timestamp === undefined || timestamp === null ) {
		timestamp = moment();
	}

	return {
		purchase: productSlug,
		purchaseId,
		...( purchaseStartDate && {
			daysSincePurchase: timestamp.diff( purchaseStartDate, 'days', true ),
		} ),
		...( siteStartDate && {
			daysSinceSiteCreation: timestamp.diff( siteStartDate, 'days', true ),
		} ),
		...surveyData,
	};
}
