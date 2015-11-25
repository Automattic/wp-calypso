import { translate } from 'lib/mixins/i18n';

const verticals = [
	{ value: 'a8c.1', label: translate( 'Arts & Entertainment' ), icon: 'video-camera', stepTwo: [
		{ value: 'a8c.1', label: translate( 'General Arts & Entertainment' ) },
		{ value: 'a8c.1.3.1', label: translate( 'Creative Arts & Design' ) },
		{ value: 'a8c.1.3.2', label: translate( 'Entertainment & Culture' ) },
		{ value: 'a8c.1.6', label: translate( 'Music' ) },
		{ value: 'a8c.1.5', label: translate( 'Movies' ) },
		{ value: 'a8c.9.23', label: translate( 'Photography' ) },
		{ value: 'a8c.18', label: translate( 'Style & Fashion' ) },
		{ value: 'a8c.17', label: translate( 'Sports & Recreation' ) },
	] },

	{ value: 'a8c.3', label: translate( 'Business & Services' ), icon: 'bookmark', stepTwo: [
		{ value: 'a8c.3', label: translate( 'General Business & Services' ) },
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

	{ value: 'a8c.6', label: translate( 'Family, Home, & Lifestyle' ), icon: 'house', stepTwo: [
		{ value: 'a8c.6', label: translate( 'Family & Parenting' ) },
		{ value: 'a8c.14.7', label: translate( 'Events & Weddings' ) },
		{ value: 'a8c.10', label: translate( 'Home & Garden' ) },
		{ value: 'a8c.8', label: translate( 'Food & Drink' ) },
		{ value: 'a8c.9.2', label: translate( 'DIY & Crafting' ) },
		{ value: 'a8c.20', label: translate( 'Travel' ) },
		{ value: 'a8c.16', label: translate( 'Pets' ) },
	] },

	{ value: 'a8c.5', label: translate( 'Education & Organizations' ), icon: 'clipboard', stepTwo: [
		{ value: 'a8c.5', label: translate( 'General Education & Organizations' ) },
		{ value: 'a8c.3.0.6', label: translate( 'Communities & Associations' ) },
		{ value: 'a8c.3.0.5', label: translate( 'Non-Profit' ) },
		{ value: 'a8c.23', label: translate( 'Religion & Spirituality' ) },
		{ value: 'a8c.5.14', label: translate( 'Special Education' ) },
		{ value: 'a8c.5.1', label: translate( 'High School Education' ) },
		{ value: 'a8c.5.5', label: translate( 'College Education' ) },
		{ value: 'a8c.5.10', label: translate( 'Homeschooling' ) },
	] },

	{ value: 'a8c.7', label: translate( 'Health & Wellness' ), icon: 'heart', stepTwo: [
		{ value: 'a8c.7', label: translate( 'General Health & Wellness' ) },
		{ value: 'a8c.7.18', label: translate( 'Depression' ) },
		{ value: 'a8c.7.42', label: translate( 'Substance Abuse' ) },
		{ value: 'a8c.7.1.1', label: translate( 'Exercise / Weight Loss' ) },
		{ value: 'a8c.7.31', label: translate( 'Men\'s Health' ) },
		{ value: 'a8c.7.45', label: translate( 'Women\'s Health' ) },
		{ value: 'a8c.7.37', label: translate( 'Psychology/Psychiatry' ) },
		{ value: 'a8c.7.32', label: translate( 'Nutrition' ) },
	] },

	{ value: 'a8c.1.1', label: translate( 'Writing & Books' ), icon: 'create', stepTwo: [
		{ value: 'a8c.1.1', label: translate( 'General Writing & Books' ) },
		{ value: 'a8c.1.1.1', label: translate( 'Book Reviews & Clubs' ) },
		{ value: 'a8c.1.4', label: translate( 'Humor' ) },
		{ value: 'a8c.1.1.2', label: translate( 'Fiction & Poetry' ) },
		{ value: 'a8c.1.1.3', label: translate( 'Author Site' ) },
		{ value: 'a8c.9.28', label: translate( 'Screenwriting' ) },
		{ value: 'a8c.1.1.4', label: translate( 'Non-fiction & Memoir' ) },
	] },
];

export default {
	get() {
		return verticals;
	}
}
