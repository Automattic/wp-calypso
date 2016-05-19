/**
 * External dependencies
 */
import shuffle from 'lodash/shuffle';
import find from 'lodash/find';
import { translate } from 'i18n-calypso';

const verticals = [
	{ value: 'a8c.1', label: translate( 'Arts & Entertainment' ), icon: 'video-camera', stepTwo: [
		{ value: 'a8c.1', label: translate( 'General Arts & Entertainment' ), isGeneral: true },
		{ value: 'a8c.1.3.1', label: translate( 'Creative Arts & Design' ) },
		{ value: 'a8c.1.3.2', label: translate( 'Entertainment & Culture' ) },
		{ value: 'a8c.1.6', label: translate( 'Music' ) },
		{ value: 'a8c.1.5', label: translate( 'Movies' ) },
		{ value: 'a8c.9.23', label: translate( 'Photography' ) },
		{ value: 'a8c.18', label: translate( 'Style & Fashion' ) },
		{ value: 'a8c.17', label: translate( 'Sports & Recreation' ) },
	] },

	{ value: 'a8c.3', label: translate( 'Business & Services' ), icon: 'briefcase', stepTwo: [
		{ value: 'a8c.3', label: translate( 'General Business & Services' ), isGeneral: true },
		{ value: 'a8c.3.0.1', label: translate( 'Finance & Law' ) },
		{ value: 'a8c.3.0.2', label: translate( 'Consulting & Coaching' ) },
		{ value: 'a8c.3.0.3', label: translate( 'Restaurants & Locales' ) },
		{ value: 'a8c.3.1.1', label: translate( 'Advertising & Marketing' ) },
		{ value: 'a8c.2', label: translate( 'Automotive' ) },
		{ value: 'a8c.21', label: translate( 'Real Estate' ) },
		{ value: 'a8c.19', label: translate( 'Technology & Computing' ) },
		{ value: 'a8c.20.18.1', label: translate( 'Hotels & Vacation Rentals' ) },
		{ value: 'a8c.3.0.4', label: translate( 'Communications' ) },
	] },

	{ value: 'a8c.9', label: translate( 'Family, Home, & Lifestyle' ), icon: 'house', stepTwo: [
		{ value: 'a8c.9', label: translate( 'General Family, Home, & Lifestyle' ), isGeneral: true },
		{ value: 'a8c.6', label: translate( 'Family & Parenting' ) },
		{ value: 'a8c.14.7', label: translate( 'Events & Weddings' ) },
		{ value: 'a8c.10', label: translate( 'Home & Garden' ) },
		{ value: 'a8c.8', label: translate( 'Food & Drink' ) },
		{ value: 'a8c.9.2', label: translate( 'DIY & Crafting' ) },
		{ value: 'a8c.20', label: translate( 'Travel' ) },
		{ value: 'a8c.16', label: translate( 'Pets' ) },
	] },

	{ value: 'a8c.5', label: translate( 'Education & Organizations' ), icon: 'institution', stepTwo: [
		{ value: 'a8c.5', label: translate( 'General Education & Organizations' ), isGeneral: true },
		{ value: 'a8c.3.0.6', label: translate( 'Communities & Associations' ) },
		{ value: 'a8c.3.0.5', label: translate( 'Non-Profit' ) },
		{ value: 'a8c.23', label: translate( 'Religion & Spirituality' ) },
		{ value: 'a8c.5.14', label: translate( 'Special Education' ) },
		{ value: 'a8c.5.1', label: translate( 'High School Education' ) },
		{ value: 'a8c.5.5', label: translate( 'College Education' ) },
		{ value: 'a8c.5.10', label: translate( 'Homeschooling' ) },
	] },

	{ value: 'a8c.7', label: translate( 'Health & Wellness' ), icon: 'heart', stepTwo: [
		{ value: 'a8c.7', label: translate( 'General Health & Wellness' ), isGeneral: true },
		{ value: 'a8c.7.37.1', label: translate( 'Mental Health' ) },
		{ value: 'a8c.7.1.1', label: translate( 'Exercise / Weight Loss' ) },
		{ value: 'a8c.7.31', label: translate( 'Men\'s Health' ) },
		{ value: 'a8c.7.45', label: translate( 'Women\'s Health' ) },
		{ value: 'a8c.7.37', label: translate( 'Psychology / Psychiatry' ) },
		{ value: 'a8c.7.32', label: translate( 'Nutrition' ) },
	] },

	{ value: 'a8c.1.1', label: translate( 'Writing & Books' ), icon: 'book', stepTwo: [
		{ value: 'a8c.1.1', label: translate( 'General Writing & Books' ), isGeneral: true },
		{ value: 'a8c.1.1.1', label: translate( 'Book Reviews & Clubs' ) },
		{ value: 'a8c.1.4', label: translate( 'Humor' ) },
		{ value: 'a8c.1.1.2', label: translate( 'Fiction & Poetry' ) },
		{ value: 'a8c.1.1.3', label: translate( 'Author Site' ) },
		{ value: 'a8c.9.28', label: translate( 'Screenwriting' ) },
		{ value: 'a8c.1.1.4', label: translate( 'Non-fiction & Memoir' ) },
	] },
];

/**
 * Shuffle a multi-dimensional array of verticals, but put the General vertical last.
 *
 * @param {Array} elements - the array of vertical elements to shuffle.
 * @returns {Array} the shuffled array of elements.
 */
function shuffleVerticals( elements ) {
	const newVerticals = shuffle( elements ).map( ( vertical ) => {
		if ( vertical.stepTwo ) {
			return Object.assign( {}, vertical, { stepTwo: shuffleVerticals( vertical.stepTwo ) } );
		}
		return vertical;
	} );
	const general = find( newVerticals, vertical => vertical.isGeneral );
	if ( general ) {
		newVerticals.splice( newVerticals.indexOf( general ), 1 );
		newVerticals.push( general );
	}
	return newVerticals;
};

export default {
	get() {
		return shuffleVerticals( verticals );
	}
}
