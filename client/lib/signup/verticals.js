/**
 * Exernal dependencies
 */

/**
 * Internal dependencies
 */

/**
 * Current list of verticals that have/will have landing pages.
 * A user who comes in via a landing page will not see the Site Topic dropdown.
 */
const verticals = [
	'Restaurant',
	'Hotel',
	'Video',
	'Car',
	'Music',
	'Home',
	'Bar',
	'Translator',
	'Grocery Store',
	'DJ',
	'Movie Theater',
	'Post Office',
	'Real Estate',
	'Internet',
	'Massage',
	'Cafe',
	'Gym',
	'Liquor Store',
	'School',
	'Shoes',
	'Parking Garage',
	'Motel',
	'Farm',
	'River',
	'Casino',
	'Zoo',
	'Pub',
	'Spa',
	'Golf',
	'Mall',
	'Fitness',
	'Computer',
	'Train Line',
	'Beach',
	'Orchestra',
	'Park',
	'Family',
	'Library',
	'Temple',
	'Bank',
	'Dentist',
	'Brewery',
	'Fast Food Restaurant',
	'Mexican Restaurant',
	'Barber Shop',
	'Warehouse',
	'Art',
	'Photo Lab',
	'Aquarium',
	'Church',
];

function isVerticalInList( vertical ) {
	const sanitizedVerticals = verticals.map( dasherize );
	vertical = dasherize( vertical );
	return verticals.includes( vertical ) || sanitizedVerticals.includes( vertical );
}

function dasherize( string ) {
	return string.toLowerCase().replace( / /g, '-' ).replace( /-+/, '-' );
}

export function isValidLandingPageVertical( vertical ) {
	if ( ! vertical || vertical === '' ) {
		return false;
	}
	return isVerticalInList( vertical );
}
