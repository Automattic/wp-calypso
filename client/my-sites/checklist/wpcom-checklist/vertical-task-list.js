/**
 * External dependencies
 */
import { find } from 'lodash';

// Full list of vertical specific tasks in alphabetical order
const verticalTaskList = {
	Accomodation: [],
	'Arts & Entertainment': [ 'portfolio_item_added' ],
	Automotive: [ 'business_hours_added', 'service_list_added' ],
	Bars: [ 'business_hours_added', 'menu_added' ],
	Beauty: [ 'portfolio_item_added' ],
	'Beer, Wine, & Liquor': [ 'business_hours_added' ],
	'Business & Services': [ 'service_list_added' ],
	Cafes: [ 'business_hours_added', 'menu_added' ],
	'Community & Non-Profit': [ 'mission_statement_added' ],
	'Construction & Housing': [ 'qualifications_added' ],
	Education: [ 'staff_info_added' ],
	Events: [ 'service_list_added' ],
	Family: [ 'mission_statement_added' ],
	'Farming & Agriculture': [],
	Fashion: [ 'portfolio_item_added' ],
	'Film & Television': [ 'service_list_added', 'portfolio_item_added' ],
	'Financial Services': [ 'qualifications_added' ],
	'Fitness & Exercise': [ 'staff_info_added' ],
	Food: [ 'business_hours_added' ],
	'Health & Medical': [ 'service_list_added', 'staff_info_added' ],
	'Home & Garden': [ 'service_list_added' ],
	Legal: [ 'qualifications_added' ],
	'Local Services': [ 'service_list_added' ],
	Manufacturing: [ 'product_list_added', 'portfolio_item_added' ],
	Music: [ 'service_list_added', 'portfolio_item_added' ],
	'Pets & Animals': [ 'service_list_added' ],
	Photography: [ 'service_list_added', 'portfolio_item_added' ],
	'Real Estate & Housing': [],
	Religion: [ 'mission_statement_added' ],
	Restaurants: [ 'business_hours_added', 'menu_added' ],
	'Shopping & Retail': [ 'business_hours_added' ],
	Sports: [ 'business_hours_added', 'service_list_added' ],
	'Transportation & Logistics': [ 'service_list_added' ],
	'Travel & Recreation': [],
};

export function getVerticalTaskList( siteVerticals ) {
	const vertical = find( siteVerticals, slug => Boolean( verticalTaskList[ slug ] ) );

	return vertical ? verticalTaskList[ vertical ] : [];
}
