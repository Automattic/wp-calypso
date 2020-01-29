/**
 * External dependencies
 */
import { find } from 'lodash';

// Full list of vertical specific tasks in alphabetical order
const verticalTaskList = {
	Accomodation: [],
	'Arts & Entertainment': [],
	Automotive: [ 'service_list_added' ],
	Bars: [],
	Beauty: [],
	'Beer, Wine, & Liquor': [],
	'Business & Services': [ 'service_list_added' ],
	Cafes: [],
	'Community & Non-Profit': [],
	'Construction & Housing': [],
	Education: [ 'staff_info_added' ],
	Events: [ 'service_list_added' ],
	Family: [],
	'Farming & Agriculture': [],
	Fashion: [],
	'Film & Television': [ 'service_list_added' ],
	'Financial Services': [],
	'Fitness & Exercise': [ 'staff_info_added' ],
	Food: [],
	'Health & Medical': [ 'service_list_added', 'staff_info_added' ],
	'Home & Garden': [ 'service_list_added' ],
	Legal: [],
	'Local Services': [ 'service_list_added' ],
	Manufacturing: [ 'product_list_added' ],
	Music: [ 'service_list_added' ],
	'Pets & Animals': [ 'service_list_added' ],
	Photography: [ 'service_list_added' ],
	'Real Estate & Housing': [],
	Religion: [],
	Restaurant: [],
	'Shopping & Retail': [],
	Sports: [ 'service_list_added' ],
	'Transportation & Logistics': [ 'service_list_added' ],
	'Travel & Recreation': [],
};

export function getVerticalTaskList( siteVerticals ) {
	const vertical = find( siteVerticals, slug => Boolean( verticalTaskList[ slug ] ) );

	return vertical ? verticalTaskList[ vertical ] : [];
}
