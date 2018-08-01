/** @format */

/**
 * Internal dependencies
 */
import { composeAnalytics, recordGoogleEvent, recordTracksEvent } from 'state/analytics/actions';

export function recordTldFilterSelected( tld, position, isSelecting ) {
	return composeAnalytics(
		recordGoogleEvent(
			'Domain Search',
			isSelecting ? 'Clicked TLD Filter Button To Select' : 'Clicked TLD Filter Button To Deselect'
		),
		recordTracksEvent(
			isSelecting
				? 'calypso_domain_search_results_tld_filter_select'
				: 'calypso_domain_search_results_tld_filter_deselect',
			{ tld, position }
		)
	);
}
