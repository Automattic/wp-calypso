import type { Pattern } from './types';

// All headers in dotcompatterns
const headerPatterns: Pattern[] = [
	{
		id: 5579,
		name: 'Centered header',
	},
	/*
	Discarded because there is a menu option named Blog
	and for now the blogger flow is not supported
	{
		id: 5608,
		name: 'Centered Header with Logo and Navigation',
	},
	*/
	{
		id: 5582,
		name: 'Simple Header',
	},
	{
		id: 5588,
		name: 'Header with site title and vertical navigation',
	},
	{
		id: 5590,
		name: 'Simple header with image background',
	},
	{
		id: 5593,
		name: 'Simple header with dark background',
	},
	{
		id: 5595,
		name: 'Simple header with image',
	},
	{
		id: 5601,
		name: 'Simple header with tagline',
	},
	{
		id: 5603,
		name: 'Header with site title and menu button',
	},
	{
		id: 5605,
		name: 'Simple header with image',
	},
	{
		id: 7914,
		name: 'Header with button',
	},
];

// All footers in dotcompatterns
// Missing footers in dotcomfsepatterns
const footerPatterns: Pattern[] = [
	{
		id: 5316,
		name: 'Footer with social icons, address, e-mail, and telephone number',
	},
	{
		id: 5886,
		name: 'Footer with large font size',
	},
	{
		id: 5883,
		name: 'Footer with credit line and navigation',
	},
	{
		id: 5888,
		name: 'Footer with navigation and credit line',
	},
	{
		id: 5877,
		name: 'Centered footer with social links',
	},
	{
		id: 5873,
		name: 'Simple centered footer',
	},
	{
		id: 7917,
		name: 'Footer with Address, Email Address, and Social Links',
	},
	{
		id: 7485,
		name: 'Footer with Newsletter Subscription Form',
	},
	{
		id: 1622,
		name: 'Footer with Paragraph and Links',
	},
	{
		id: 5047,
		name: 'Footer with Navigation, Contact Details, Social Links, and Subscription Form',
	},
	{
		id: 5880,
		name: 'Footer with background color and three columns',
	},
];

const sectionPatterns: Pattern[] = [
	{
		id: 7156,
		name: 'Media and text with image on the right',
	},
	{
		id: 7153,
		name: 'Media and text with image on the left',
	},
	{
		id: 7146,
		name: 'Four column list',
	},
	{
		id: 7132,
		name: 'Cover image with left-aligned call to action',
	},
	{
		id: 7159,
		name: 'Cover image with centered text and a button',
	},
	{
		id: 7149,
		name: 'Two column image grid',
	},
	{
		id: 5691,
		name: 'Three Logos, Heading, and Paragraphs',
	},
	{
		id: 7143,
		name: 'Full-width image',
	},
	{
		id: 737,
		name: 'Logos',
	},
	{
		id: 1585,
		name: 'Quote and logos',
	},
	{
		id: 7135,
		name: 'Three columns with images and text',
	},
	{
		id: 789,
		name: 'Numbered List',
	},
	{
		id: 6712,
		name: 'List of events',
	},
	{
		id: 5666,
		name: 'Large Numbers, heading, and paragraphs',
	},
	{
		id: 462,
		name: 'Numbers',
	},
	{
		id: 5663,
		name: 'Large Headline',
	},
	{
		id: 7140,
		name: 'Left-aligned headline',
	},
	{
		id: 7138,
		name: 'Centered headline and text',
	},
	{
		id: 7161,
		name: 'Two testimonials side by side',
	},
	{
		id: 1600,
		name: 'Three Column Text and Links',
	},
];

export { headerPatterns, footerPatterns, sectionPatterns };
