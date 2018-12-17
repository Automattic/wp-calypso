/** @format */
/**
 * External Dependencies
 */
import apiFetch from '@wordpress/api-fetch';

export default function getLocalizedWeek() {
	return apiFetch( { path: '/wpcom/v2/business-hours/localized-week' } );
}
