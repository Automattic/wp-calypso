import { translate } from 'i18n-calypso';
import type { Pattern } from './types';

// All headers in dotcompatterns
const headerPatterns: Pattern[] = [
	{
		id: 5579,
	},
	{
		id: 5608,
	},
	{
		id: 5582,
	},
	{
		id: 5588,
	},
	{
		id: 5590,
	},
	{
		id: 5593,
	},
	{
		id: 5595,
	},
	{
		id: 5601,
	},
	{
		id: 5603,
	},
	{
		id: 5605,
	},
	{
		id: 7914,
	},
];

// All footers in dotcompatterns
// Missing footers in dotcomfsepatterns
const footerPatterns: Pattern[] = [
	{
		id: 5316,
	},
	{
		id: 5886,
	},
	{
		id: 5883,
	},
	{
		id: 5888,
	},
	{
		id: 5877,
	},
	{
		id: 5873,
	},
	{
		id: 7917,
	},
	{
		id: 7485,
	},
	{
		id: 1622,
	},
	{
		id: 5047,
	},
	{
		id: 5880,
	},
];

const sectionPatterns: Pattern[] = [
	{
		id: 7156,
		name: translate( 'Call To Action 1' ),
	},
	{
		id: 7153,
		name: translate( 'Call To Action 2' ),
	},
	{
		id: 7146,
		name: translate( 'Call To Action 3' ),
	},
	{
		id: 7132,
		name: translate( 'Call To Action 4' ),
	},
	{
		id: 7159,
		name: translate( 'Call To Action 5' ),
	},
	{
		id: 7149,
		name: translate( 'Images 1' ),
	},
	{
		id: 5691,
		name: translate( 'Images 2' ),
	},
	{
		id: 7143,
		name: translate( 'Images 3' ),
	},
	{
		id: 737,
		name: translate( 'Images 4' ),
	},
	{
		id: 1585,
		name: translate( 'Images 5' ),
	},
	{
		id: 7135,
		name: translate( 'List 1' ),
	},
	{
		id: 789,
		name: translate( 'List 2' ),
	},
	{
		id: 6712,
		name: translate( 'List 3' ),
	},
	{
		id: 5666,
		name: translate( 'Numbers 1' ),
	},
	{
		id: 462,
		name: translate( 'Numbers 2' ),
	},
	{
		id: 5663,
		name: translate( 'About 1' ),
	},
	{
		id: 7140,
		name: translate( 'About 2' ),
	},
	{
		id: 7138,
		name: translate( 'About 3' ),
	},
	{
		id: 7161,
		name: translate( 'Testimonials' ),
	},
	{
		id: 1600,
		name: translate( 'Links' ),
	},
];

export { headerPatterns, footerPatterns, sectionPatterns };
