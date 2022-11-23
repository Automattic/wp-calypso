import { translate } from 'i18n-calypso';
import type { Pattern } from './types';

// Category translations with an incremental number
const categoryNumbers = ( ( count = 0 ) => {
	return () => translate( 'Numbers %(count)d', { args: { count: ( count += 1 ) } } );
} )();

const categoryCallToAction = ( ( count = 0 ) => {
	return () => translate( 'Call To Action %(count)d', { args: { count: ( count += 1 ) } } );
} )();

const categoryImages = ( ( count = 0 ) => {
	return () => translate( 'Images %(count)d', { args: { count: ( count += 1 ) } } );
} )();

const categoryList = ( ( count = 0 ) => {
	return () => translate( 'List %(count)d', { args: { count: ( count += 1 ) } } );
} )();

const categoryAbout = ( ( count = 0 ) => {
	return () => translate( 'About %(count)d', { args: { count: ( count += 1 ) } } );
} )();

const categoryTestimonials = ( ( count = 0 ) => {
	return () => translate( 'Testimonials %(count)d', { args: { count: ( count += 1 ) } } );
} )();

const categoryLinks = ( ( count = 0 ) => {
	return () => translate( 'Links %(count)d', { args: { count: ( count += 1 ) } } );
} )();

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
		name: categoryCallToAction(),
	},
	{
		id: 7153,
		name: categoryCallToAction(),
	},
	{
		id: 7146,
		name: categoryCallToAction(),
	},
	{
		id: 7132,
		name: categoryCallToAction(),
	},
	{
		id: 7159,
		name: categoryCallToAction(),
	},
	{
		id: 7149,
		name: categoryImages(),
	},
	{
		id: 5691,
		name: categoryImages(),
	},
	{
		id: 7143,
		name: categoryImages(),
	},
	{
		id: 737,
		name: categoryImages(),
	},
	{
		id: 1585,
		name: categoryImages(),
	},
	{
		id: 7135,
		name: categoryList(),
	},
	{
		id: 789,
		name: categoryList(),
	},
	{
		id: 6712,
		name: categoryList(),
	},
	{
		id: 5666,
		name: categoryNumbers(),
	},
	{
		id: 462,
		name: categoryNumbers(),
	},
	{
		id: 5663,
		name: categoryAbout(),
	},
	{
		id: 7140,
		name: categoryAbout(),
	},
	{
		id: 7138,
		name: categoryAbout(),
	},
	{
		id: 7161,
		name: categoryTestimonials(),
	},
	{
		id: 1600,
		name: categoryLinks(),
	},
];

export { headerPatterns, footerPatterns, sectionPatterns };
